"use server";

import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { chatThreads, chatMessages, courses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getThreadWithMessages } from "@/data/chat";

/**
 * Server Action: Create a new blank chat thread for a course.
 */
export async function createThreadAction(courseId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.userId, session.user.id)),
    columns: { id: true, slug: true },
  });

  if (!course) {
    return { success: false, error: "Course not found" };
  }

  const [newThread] = await db
    .insert(chatThreads)
    .values({
      courseId,
      userId: session.user.id,
      title: "New Chat",
    })
    .returning();

  revalidatePath(`/courses/${course.slug}`);

  return { success: true, data: { threadId: newThread.id } };
}

/**
 * Server Action: Rename an existing chat thread.
 */
export async function renameThreadAction(threadId: string, newTitle: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const title = newTitle.trim();
  if (!title) {
    return { success: false, error: "Title cannot be empty" };
  }

  const thread = await db.query.chatThreads.findFirst({
    where: and(eq(chatThreads.id, threadId), eq(chatThreads.userId, session.user.id)),
  });

  if (!thread) {
    return { success: false, error: "Thread not found" };
  }

  await db
    .update(chatThreads)
    .set({ title: title.slice(0, 80), updatedAt: new Date() })
    .where(eq(chatThreads.id, threadId));

  return { success: true };
}

/**
 * Server Action: Delete a chat thread and all its messages.
 */
export async function deleteThreadAction(threadId: string, courseSlug: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const thread = await db.query.chatThreads.findFirst({
    where: and(eq(chatThreads.id, threadId), eq(chatThreads.userId, session.user.id)),
  });

  if (!thread) {
    return { success: false, error: "Thread not found" };
  }

  await db.delete(chatThreads).where(eq(chatThreads.id, threadId));

  revalidatePath(`/courses/${courseSlug}`);

  return { success: true };
}

/**
 * Server Action: Delete the last assistant message in a thread to allow clean regeneration.
 * Returns the text of the preceding user message so the client can resubmit.
 */
export async function prepareRegenerateAction(threadId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const thread = await db.query.chatThreads.findFirst({
    where: and(eq(chatThreads.id, threadId), eq(chatThreads.userId, session.user.id)),
  });

  if (!thread) {
    return { success: false, error: "Thread not found" };
  }

  // Get last two messages
  const msgs = await db.query.chatMessages.findMany({
    where: eq(chatMessages.threadId, threadId),
    orderBy: [desc(chatMessages.createdAt)],
    limit: 2,
  });

  if (msgs.length === 0) {
    return { success: false, error: "No messages to regenerate" };
  }

  let promptToResubmit = "";
  if (msgs[0].role === "assistant") {
    // Delete last assistant message
    await db.delete(chatMessages).where(eq(chatMessages.id, msgs[0].id));
    if (msgs.length > 1 && msgs[1].role === "user") {
      promptToResubmit = msgs[1].content;
      // Delete the previous user message because the chat stream endpoint saves user message on start
      await db.delete(chatMessages).where(eq(chatMessages.id, msgs[1].id));
    }
  } else if (msgs[0].role === "user") {
    promptToResubmit = msgs[0].content;
    await db.delete(chatMessages).where(eq(chatMessages.id, msgs[0].id));
  }

  return { success: true, data: { prompt: promptToResubmit } };
}

/**
 * Server Action: Load all messages for a thread.
 */
export async function getThreadMessagesAction(threadId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await getThreadWithMessages(threadId, session.user.id);
  if (!result.thread) {
    return { success: false, error: "Thread not found" };
  }

  return { success: true, data: result };
}

