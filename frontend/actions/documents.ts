"use server";

import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { documents, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/action-result";
import type { DocumentItem, DocumentStatus } from "@/types/document";

interface CreateDocumentInput {
  courseId: string;
  courseSlug: string;
  title: string;
  fileSizeBytes: number;
  pageCount?: number;
  status?: DocumentStatus;
}

/**
 * Server Action: Save an uploaded document entry into the database.
 * Enables the frontend-only PDF upload pipeline to persist actual documents
 * cleanly and reliably.
 */
export async function createDocumentAction(
  input: CreateDocumentInput
): Promise<ActionResult<DocumentItem>> {
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

  try {
    const r2Key = `uploads/${session.user.id}/${input.courseId}/${Date.now()}-${input.title.replace(/\s+/g, "_")}`;
    const pageCount = input.pageCount ?? Math.max(1, Math.round(input.fileSizeBytes / (120 * 1024)));

    const [inserted] = await db
      .insert(documents)
      .values({
        courseId: input.courseId,
        userId: session.user.id,
        title: input.title,
        r2Key,
        fileSizeBytes: input.fileSizeBytes,
        pageCount,
        status: input.status ?? "READY",
      })
      .returning();

    // Revalidate affected routes
    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${input.courseSlug}`);

    return {
      success: true,
      data: inserted as DocumentItem,
    };
  } catch (err) {
    console.error("[createDocumentAction] Error:", err);
    return {
      success: false,
      error: "Failed to save document. Please try again.",
    };
  }
}

/**
 * Server Action: Delete a document belonging to the user.
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
    const [deleted] = await db
      .delete(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.userId, session.user.id)
        )
      )
      .returning({ id: documents.id });

    if (!deleted) {
      return {
        success: false,
        error: "Document not found or unauthorized.",
      };
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
