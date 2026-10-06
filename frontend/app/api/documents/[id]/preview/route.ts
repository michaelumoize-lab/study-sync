import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/lib/r2";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch document and enforce user ownership
  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.userId, session.user.id)),
    columns: {
      id: true,
      title: true,
      r2Key: true,
      status: true,
    },
  });

  if (!doc || !doc.r2Key) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // 2. Check if request asks for a forced download or inline viewer preview
  const searchParams = request.nextUrl.searchParams;
  const isDownload = searchParams.get("download") === "1";

  try {
    const filename = `${doc.title.replace(/\.pdf$/i, "")}.pdf`;
    const presignedUrl = await generatePresignedDownloadUrl(doc.r2Key, 3600, {
      inline: !isDownload,
      filename,
    });

    // 3. Redirect browser to secure Cloudflare R2 presigned GET stream
    return NextResponse.redirect(presignedUrl, { status: 307 });
  } catch (err) {
    console.error("[GET /api/documents/[id]/preview] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate document preview link" },
      { status: 500 }
    );
  }
}
