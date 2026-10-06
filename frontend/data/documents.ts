import { cache } from "react";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import type { DocumentItem } from "@/types/document";

/**
 * Data Access Layer: Fetch all documents for a specific course, strictly scoped to the user.
 * Excludes documents in FAILED status or unconfirmed UPLOADING status.
 */
export const getDocumentsForCourse = cache(
  async (courseId: string, userId: string): Promise<DocumentItem[]> => {
    const records = await db.query.documents.findMany({
      where: and(
        eq(documents.courseId, courseId),
        eq(documents.userId, userId),
        ne(documents.status, "FAILED"),
        ne(documents.status, "UPLOADING")
      ),
      orderBy: [desc(documents.createdAt)],
    });

    return records as DocumentItem[];
  }
);

/**
 * Data Access Layer: Fetch a single document by ID, scoped to user.
 */
export const getDocumentById = cache(
  async (documentId: string, userId: string): Promise<DocumentItem | null> => {
    const doc = await db.query.documents.findFirst({
      where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
    });

    return (doc as DocumentItem) || null;
  }
);
