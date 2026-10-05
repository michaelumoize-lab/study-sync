import { cache } from "react";
import { db } from "@/db";
import {
  courses,
  documents,
  chatThreads,
  flashcardDecks,
  quizzes,
  quizAttempts,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCoursesForUser } from "./courses";
import type { CourseWithStats } from "@/types/course";

export type ActivityType = "document" | "chat" | "flashcard" | "quiz" | "course";

export interface DashboardActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseColor: string;
  timestamp: Date;
  detail: string;
  href: string;
}

export interface ContinueStudyingData {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseColor: string;
  activityTitle: string;
  activityType: ActivityType;
  timestamp: Date;
  href: string;
  isInitialCourse?: boolean;
}

export interface DashboardData {
  courses: CourseWithStats[];
  recentActivity: DashboardActivityItem[];
  continueStudying: ContinueStudyingData | null;
}

/**
 * Data Access Layer: Fetch recent learning activity across documents, chats, flashcards, and quizzes.
 * Strictly scoped to session userId and request-memoized via React cache().
 */
export const getRecentActivityForUser = cache(
  async (userId: string, limit: number = 5): Promise<DashboardActivityItem[]> => {
    const [docs, chats, decks, attempts, createdQuizzes] = await Promise.all([
      db.query.documents.findMany({
        where: eq(documents.userId, userId),
        orderBy: [desc(documents.createdAt)],
        limit,
        with: {
          course: {
            columns: { id: true, title: true, color: true, slug: true },
          },
        },
      }),
      db.query.chatThreads.findMany({
        where: eq(chatThreads.userId, userId),
        orderBy: [desc(chatThreads.updatedAt)],
        limit,
        with: {
          course: {
            columns: { id: true, title: true, color: true, slug: true },
          },
        },
      }),
      db.query.flashcardDecks.findMany({
        where: eq(flashcardDecks.userId, userId),
        orderBy: [desc(flashcardDecks.createdAt)],
        limit,
        with: {
          course: {
            columns: { id: true, title: true, color: true, slug: true },
          },
        },
      }),
      db.query.quizAttempts.findMany({
        where: eq(quizAttempts.userId, userId),
        orderBy: [desc(quizAttempts.completedAt)],
        limit,
        with: {
          quiz: {
            columns: { id: true, title: true },
            with: {
              course: {
                columns: { id: true, title: true, color: true, slug: true },
              },
            },
          },
        },
      }),
      db.query.quizzes.findMany({
        where: eq(quizzes.userId, userId),
        orderBy: [desc(quizzes.createdAt)],
        limit,
        with: {
          course: {
            columns: { id: true, title: true, color: true, slug: true },
          },
        },
      }),
    ]);

    const items: DashboardActivityItem[] = [];

    // 1. Documents
    for (const doc of docs) {
      if (doc.course) {
        items.push({
          id: `doc-${doc.id}`,
          type: "document",
          title: doc.title,
          courseId: doc.courseId,
          courseTitle: doc.course.title,
          courseSlug: doc.course.slug,
          courseColor: doc.course.color,
          timestamp: doc.createdAt,
          detail: doc.status === "READY" ? "Document ready to study" : "PDF document uploaded",
          href: `/courses/${doc.course.slug}`,
        });
      }
    }

    // 2. Chat Threads
    for (const chat of chats) {
      if (chat.course) {
        items.push({
          id: `chat-${chat.id}`,
          type: "chat",
          title: chat.title,
          courseId: chat.courseId,
          courseTitle: chat.course.title,
          courseSlug: chat.course.slug,
          courseColor: chat.course.color,
          timestamp: chat.updatedAt,
          detail: "Chat conversation updated",
          href: `/courses/${chat.course.slug}`,
        });
      }
    }

    // 3. Flashcard Decks
    for (const deck of decks) {
      if (deck.course) {
        items.push({
          id: `deck-${deck.id}`,
          type: "flashcard",
          title: deck.title,
          courseId: deck.courseId,
          courseTitle: deck.course.title,
          courseSlug: deck.course.slug,
          courseColor: deck.course.color,
          timestamp: deck.createdAt,
          detail: "Flashcard deck generated",
          href: `/courses/${deck.course.slug}`,
        });
      }
    }

    // 4. Quiz Attempts
    for (const attempt of attempts) {
      if (attempt.quiz?.course) {
        items.push({
          id: `attempt-${attempt.id}`,
          type: "quiz",
          title: attempt.quiz.title,
          courseId: attempt.quiz.course.id,
          courseTitle: attempt.quiz.course.title,
          courseSlug: attempt.quiz.course.slug,
          courseColor: attempt.quiz.course.color,
          timestamp: attempt.completedAt,
          detail: `Quiz completed — ${attempt.scorePercent}%`,
          href: `/courses/${attempt.quiz.course.slug}`,
        });
      }
    }

    // 5. Quizzes (if not already captured in attempts)
    const attemptedQuizIds = new Set(attempts.map((a) => a.quizId));
    for (const quiz of createdQuizzes) {
      if (quiz.course && !attemptedQuizIds.has(quiz.id)) {
        items.push({
          id: `quiz-${quiz.id}`,
          type: "quiz",
          title: quiz.title,
          courseId: quiz.courseId,
          courseTitle: quiz.course.title,
          courseSlug: quiz.course.slug,
          courseColor: quiz.course.color,
          timestamp: quiz.createdAt,
          detail: "Practice quiz created",
          href: `/courses/${quiz.course.slug}`,
        });
      }
    }

    // Sort newest first and return top items
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return items.slice(0, limit);
  }
);

/**
 * Data Access Layer: Unified dashboard loader fetching courses, recent activity,
 * and determining the current 'Continue Studying' priority item.
 */
export const getDashboardData = cache(
  async (userId: string): Promise<DashboardData> => {
    const [coursesList, recentActivity] = await Promise.all([
      getCoursesForUser(userId),
      getRecentActivityForUser(userId, 6),
    ]);

    let continueStudying: ContinueStudyingData | null = null;

    if (recentActivity.length > 0) {
      const top = recentActivity[0];
      continueStudying = {
        courseId: top.courseId,
        courseTitle: top.courseTitle,
        courseSlug: top.courseSlug,
        courseColor: top.courseColor,
        activityTitle: top.title,
        activityType: top.type,
        timestamp: top.timestamp,
        href: top.href,
        isInitialCourse: false,
      };
    } else if (coursesList.length > 0) {
      const newestCourse = coursesList[0];
      continueStudying = {
        courseId: newestCourse.id,
        courseTitle: newestCourse.title,
        courseSlug: newestCourse.slug,
        courseColor: newestCourse.color,
        activityTitle: "Upload lecture slides & study materials",
        activityType: "course",
        timestamp: newestCourse.updatedAt,
        href: `/courses/${newestCourse.slug}`,
        isInitialCourse: true,
      };
    }

    return {
      courses: coursesList,
      recentActivity,
      continueStudying,
    };
  }
);
