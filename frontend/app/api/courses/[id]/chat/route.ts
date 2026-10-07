import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { courses, documents, chatThreads } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { countUserRecentMessages } from "@/data/chat";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "studysync-internal-secret-2026";
const MAX_HOURLY_MESSAGES = 30;

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id: courseId } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Verify user owns course
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.userId, session.user.id)),
    columns: { id: true, title: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
  }

  // 2. Check Rate Limit (30 messages in trailing 60 minutes)
  const recentCount = await countUserRecentMessages(session.user.id, 60);
  if (recentCount >= MAX_HOURLY_MESSAGES) {
    return NextResponse.json(
      {
        error: "Study pace limit reached. You can send up to 30 questions per hour. Please take a short break!",
        isRateLimited: true,
      },
      { status: 429 }
    );
  }

  // 3. Parse and validate body
  const body = await request.json();
  const userPrompt = (body.userPrompt || "").trim();
  let threadId = body.threadId as string | undefined;
  const documentId = body.documentId as string | undefined;
  const history = Array.isArray(body.history) ? body.history : [];

  if (!userPrompt) {
    return NextResponse.json({ error: "Message prompt cannot be empty" }, { status: 400 });
  }

  if (userPrompt.length > 4000) {
    return NextResponse.json(
      { error: "Message exceeds maximum length of 4,000 characters" },
      { status: 400 }
    );
  }

  // 4. Verify or create thread
  if (!threadId) {
    const [newThread] = await db
      .insert(chatThreads)
      .values({
        courseId,
        userId: session.user.id,
        title: "New Chat",
      })
      .returning();
    threadId = newThread.id;
  } else {
    const thread = await db.query.chatThreads.findFirst({
      where: and(
        eq(chatThreads.id, threadId),
        eq(chatThreads.courseId, courseId),
        eq(chatThreads.userId, session.user.id)
      ),
      columns: { id: true },
    });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
  }

  // 5. Verify documentId filter if provided
  if (documentId) {
    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.courseId, courseId),
        eq(documents.status, "READY")
      ),
      columns: { id: true },
    });
    if (!doc) {
      return NextResponse.json({ error: "Selected document filter not found or not ready" }, { status: 400 });
    }
  }

  // 6. Forward streaming request to FastAPI
  const fastApiUrl = `${FASTAPI_URL}/internal/courses/${courseId}/chat/stream`;

  try {
    const upstreamRes = await fetch(fastApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        thread_id: threadId,
        user_prompt: userPrompt,
        history,
        document_id: documentId || null,
        course_title: course.title,
      }),
      signal: request.signal, // Propagate client abort to FastAPI
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      const errText = await upstreamRes.text();
      console.error("[Chat Proxy] Upstream FastAPI error:", upstreamRes.status, errText);
      return NextResponse.json(
        { error: "AI Tutor service is momentarily unavailable. Please retry." },
        { status: 502 }
      );
    }

    // Return SSE stream back to client
    return new Response(upstreamRes.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Thread-Id": threadId,
      },
    });
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.log("[Chat Proxy] Request was aborted by client.");
      return new Response(null, { status: 499 });
    }
    console.error("[Chat Proxy] Failed to proxy request:", err);
    return NextResponse.json({ error: "Failed to connect to AI engine" }, { status: 500 });
  }
}
