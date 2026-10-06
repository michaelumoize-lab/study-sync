"use server";

import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { documents, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slug";
import { generatePresignedUploadUrl, deleteR2Object } from "@/lib/r2";
import type { ActionResult } from "@/types/action-result";
import type { DocumentItem, DocumentStatus } from "@/types/document";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

interface CreateUploadSessionInput {
  courseId: string;
  courseSlug: string;
  filename: string;
  fileSizeBytes: number;
}

export interface UploadSessionResult {
  documentId: string;
  r2Key: string;
  uploadUrl: string;
}

/**
 * Server Action: Initiate a direct Cloudflare R2 upload session.
 * Validates course ownership, creates initial document record in 'UPLOADING' status,
 * and issues a short-lived (15 min) pre-signed PUT URL.
 */
export async function createDocumentUploadSessionAction(
  input: CreateUploadSessionInput
): Promise<ActionResult<UploadSessionResult>> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to upload documents.",
    };
  }

  // 1. Verify user ownership of the course
  const course = await db.query.courses.findFirst({
    where: and(
      eq(courses.id, input.courseId),
      eq(courses.userId, session.user.id)
    ),
    columns: { id: true, slug: true },
  });

  if (!course) {
    return {
      success: false,
      error: "Course not found or unauthorized.",
    };
  }

  // 2. Validate file parameters
  if (input.fileSizeBytes <= 0 || input.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size must be between 1 byte and 50 MB.`,
    };
  }

  try {
    const rawName = input.filename.replace(/\.pdf$/i, "").trim() || "document";
    const cleanSlug = slugify(rawName);
    const r2Key = `uploads/${session.user.id}/${input.courseId}/${Date.now()}-${cleanSlug}.pdf`;
    const cleanTitle = rawName;

    // 3. Insert initial document row with UPLOADING status
    const [inserted] = await db
      .insert(documents)
      .values({
        courseId: input.courseId,
        userId: session.user.id,
        title: cleanTitle,
        r2Key,
        fileSizeBytes: input.fileSizeBytes,
        pageCount: 0,
        status: "UPLOADING",
      })
      .returning();

    // 4. Generate S3 presigned PUT URL
    const uploadUrl = await generatePresignedUploadUrl(
      r2Key,
      900 // 15 minutes
    );

    return {
      success: true,
      data: {
        documentId: inserted.id,
        r2Key,
        uploadUrl,
      },
    };
  } catch (err) {
    console.error("[createDocumentUploadSessionAction] Error:", err);
    return {
      success: false,
      error: "Failed to initialize upload session. Please check storage configuration.",
    };
  }
}

/**
 * Server Action: Confirm the client has uploaded raw bytes to Cloudflare R2,
 * mark the document 'UPLOADED', and dispatch the background ingestion job to FastAPI.
 */
export async function confirmDocumentUploadAction(
  documentId: string,
  courseSlug: string
): Promise<ActionResult<{ status: DocumentStatus }>> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  try {
    // 1. Verify ownership and fetch document
    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.userId, session.user.id)
      ),
    });

    if (!doc) {
      return {
        success: false,
        error: "Document record not found.",
      };
    }

    // 2. Update status to UPLOADED
    await db
      .update(documents)
      .set({
        status: "UPLOADED",
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // 3. Dispatch asynchronous ingestion job to FastAPI worker
    try {
      const response = await fetch(
        `${FASTAPI_URL}/internal/documents/${documentId}/ingest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": INTERNAL_API_SECRET,
          },
        }
      );

      if (!response.ok) {
        console.warn(
          `[confirmDocumentUploadAction] FastAPI responded with status ${response.status}`
        );
      }
    } catch (apiErr) {
      console.warn(
        `[confirmDocumentUploadAction] Could not reach FastAPI worker directly at ${FASTAPI_URL}:`,
        apiErr
      );
      // Background worker might be starting; document remains UPLOADED for recovery
    }

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseSlug}`);

    return {
      success: true,
      data: { status: "UPLOADED" },
    };
  } catch (err) {
    console.error("[confirmDocumentUploadAction] Error:", err);
    return {
      success: false,
      error: "Failed to confirm upload.",
    };
  }
}

/**
 * Server Action: Permanently delete a document, cascading its chunks in Neon
 * and purging the raw binary from Cloudflare R2.
 */
export async function deleteDocumentAction(
  documentId: string,
  courseSlug: string
): Promise<ActionResult<void>> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to delete documents.",
    };
  }

  try {
    // 1. Fetch document to retrieve its r2Key
    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.userId, session.user.id)
      ),
      columns: { id: true, r2Key: true },
    });

    if (!doc) {
      return {
        success: false,
        error: "Document not found or unauthorized.",
      };
    }

    // 2. Delete row from database (cascades document_chunks)
    await db
      .delete(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.userId, session.user.id)
        )
      );

    // 3. Purge raw file from Cloudflare R2
    if (doc.r2Key) {
      await deleteR2Object(doc.r2Key);
    }

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseSlug}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (err) {
    console.error("[deleteDocumentAction] Error:", err);
    return {
      success: false,
      error: "Failed to delete document. Please try again.",
    };
  }
}

/**
 * Server Action: Roll back and cancel an abandoned or failed upload session.
 * Removes the unconfirmed 'UPLOADING' document row from the database.
 */
export async function cancelDocumentUploadSessionAction(
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.userId, session.user.id),
        eq(documents.status, "UPLOADING")
      ),
      columns: { id: true, r2Key: true },
    });

    if (doc) {
      await db.delete(documents).where(eq(documents.id, documentId));
      if (doc.r2Key) {
        await deleteR2Object(doc.r2Key);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[cancelDocumentUploadSessionAction] Error:", err);
    return { success: false, error: "Failed to cancel upload session" };
  }
}

