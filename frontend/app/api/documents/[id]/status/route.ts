import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const STALE_JOB_THRESHOLD_MS = 120 * 1000; // 120 seconds

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.userId, session.user.id)),
    columns: {
      id: true,
      status: true,
      pageCount: true,
      errorMessage: true,
      processingStartedAt: true,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Automatic stale job recovery: if document stuck in PROCESSING for > 120s
  if (
    doc.status === "PROCESSING" &&
    doc.processingStartedAt &&
    Date.now() - new Date(doc.processingStartedAt).getTime() > STALE_JOB_THRESHOLD_MS
  ) {
    await db
      .update(documents)
      .set({
        status: "FAILED",
        errorMessage: "Processing timed out. Please try uploading again.",
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id));

    return NextResponse.json({
      id: doc.id,
      status: "FAILED",
      pageCount: doc.pageCount,
      errorMessage: "Processing timed out. Please try uploading again.",
    });
  }

  return NextResponse.json({
    id: doc.id,
    status: doc.status,
    pageCount: doc.pageCount,
    errorMessage: doc.errorMessage,
  });
}
