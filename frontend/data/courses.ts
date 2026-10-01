import { cache } from "react";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { CourseWithStats } from "@/types/course";

/**
 * Data Access Layer: Fetch all courses belonging to a user with attached statistics.
 * Wrapped with React cache() to deduplicate requests within the same render pass.
 */
export const getCoursesForUser = cache(
  async (userId: string): Promise<CourseWithStats[]> => {
    const records = await db.query.courses.findMany({
      where: eq(courses.userId, userId),
      orderBy: [desc(courses.updatedAt)],
      with: {
        documents: {
          columns: {
            id: true,
          },
        },
        flashcardDecks: {
          columns: {
            id: true,
          },
        },
        quizzes: {
          columns: {
            id: true,
          },
        },
        chatThreads: {
          columns: {
            id: true,
          },
        },
      },
    });

    return records.map((course) => ({
      id: course.id,
      userId: course.userId,
      title: course.title,
      description: course.description,
      color: course.color,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      stats: {
        documentCount: course.documents?.length ?? 0,
        deckCount: course.flashcardDecks?.length ?? 0,
        quizCount: course.quizzes?.length ?? 0,
        threadCount: course.chatThreads?.length ?? 0,
      },
    }));
  }
);

/**
 * Data Access Layer: Fetch a single course by ID, strictly enforcing user ownership.
 */
export const getCourseById = cache(
  async (courseId: string, userId: string): Promise<CourseWithStats | null> => {
    const course = await db.query.courses.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.id, courseId), eq(table.userId, userId)),
      with: {
        documents: {
          columns: { id: true },
        },
        flashcardDecks: {
          columns: { id: true },
        },
        quizzes: {
          columns: { id: true },
        },
        chatThreads: {
          columns: { id: true },
        },
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      userId: course.userId,
      title: course.title,
      description: course.description,
      color: course.color,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      stats: {
        documentCount: course.documents?.length ?? 0,
        deckCount: course.flashcardDecks?.length ?? 0,
        quizCount: course.quizzes?.length ?? 0,
        threadCount: course.chatThreads?.length ?? 0,
      },
    };
  }
);
