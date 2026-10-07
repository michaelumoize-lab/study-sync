import { cache } from "react";
import { db } from "@/db";
import { chatThreads, chatMessages, documents } from "@/db/schema";
import { eq, and, desc, gte, inArray } from "drizzle-orm";
import type { ChatCitation } from "@/db/schema/chat";

export interface ThreadListItem {
  id: string;
  courseId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageSnippet?: string;
  messageCount: number;
}

export interface EnrichedChatMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  status: "complete" | "stopped" | "error";
  model: string | null;
  citations: ChatCitation[] | null;
  createdAt: Date;
}

/**
 * Fetch all chat threads for a given course, scoped to user, newest first.
 */
export const getThreadsForCourse = cache(
  async (courseId: string, userId: string): Promise<ThreadListItem[]> => {
    const threads = await db.query.chatThreads.findMany({
      where: and(eq(chatThreads.courseId, courseId), eq(chatThreads.userId, userId)),
      orderBy: [desc(chatThreads.updatedAt)],
      with: {
        messages: {
          columns: {
            id: true,
            content: true,
            createdAt: true,
          },
          orderBy: [desc(chatMessages.createdAt)],
          limit: 1,
        },
      },
    });

    return threads.map((t) => {
      const lastMsg = t.messages?.[0];
      return {
        id: t.id,
        courseId: t.courseId,
        title: t.title,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        lastMessageSnippet: lastMsg?.content
          ? lastMsg.content.slice(0, 80) + (lastMsg.content.length > 80 ? "..." : "")
          : undefined,
        messageCount: t.messages?.length ?? 0,
      };
    });
  }
);

/**
 * Fetch single thread with full message history, resolving isDetached for citations.
 */
export const getThreadWithMessages = cache(
  async (
    threadId: string,
    userId: string
  ): Promise<{
    thread: typeof chatThreads.$inferSelect | null;
    messages: EnrichedChatMessage[];
  }> => {
    const thread = await db.query.chatThreads.findFirst({
      where: and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)),
    });

    if (!thread) {
      return { thread: null, messages: [] };
    }

    const rawMessages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.threadId, threadId),
      orderBy: [chatMessages.createdAt],
    });

    // Gather all document IDs referenced in citations to check which still exist in READY state
    const allDocIds = new Set<string>();
    for (const m of rawMessages) {
      if (Array.isArray(m.citations)) {
        for (const c of m.citations) {
          if (c.documentId) allDocIds.add(c.documentId);
        }
      }
    }

    const activeDocs =
      allDocIds.size > 0
        ? await db.query.documents.findMany({
            where: inArray(documents.id, Array.from(allDocIds)),
            columns: { id: true, title: true, status: true },
          })
        : [];
    const activeDocMap = new Map(activeDocs.map((d) => [d.id, d]));

    const enrichedMessages: EnrichedChatMessage[] = rawMessages.map((m) => {
      let resolvedCitations: ChatCitation[] | null = null;
      if (Array.isArray(m.citations)) {
        resolvedCitations = m.citations.map((c) => {
          const doc = activeDocMap.get(c.documentId);
          const isDetached = !doc || doc.status !== "READY";
          return {
            ...c,
            documentTitle: doc ? doc.title : c.documentTitle,
            isDetached,
          };
        });
      }

      return {
        id: m.id,
        threadId: m.threadId,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        status: (m.status as "complete" | "stopped" | "error") || "complete",
        model: m.model ?? null,
        citations: resolvedCitations,
        createdAt: m.createdAt,
      };
    });

    return { thread, messages: enrichedMessages };
  }
);

/**
 * Count user messages in trailing window for rate limiting (max 30 msgs / hour).
 */
export async function countUserRecentMessages(
  userId: string,
  windowMinutes: number = 60
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Join chatMessages on chatThreads for user_id
  const userThreads = await db.query.chatThreads.findMany({
    where: eq(chatThreads.userId, userId),
    columns: { id: true },
  });

  if (userThreads.length === 0) return 0;
  const threadIds = userThreads.map((t) => t.id);

  const recentMsgs = await db.query.chatMessages.findMany({
    where: and(
      inArray(chatMessages.threadId, threadIds),
      eq(chatMessages.role, "user"),
      gte(chatMessages.createdAt, since)
    ),
    columns: { id: true },
  });

  return recentMsgs.length;
}
