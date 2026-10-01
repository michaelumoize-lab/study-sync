"use server";

import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { count, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/types/course";
import type { ActionResult } from "@/types/action-result";

const MAX_FREE_COURSES = 5;

/**
 * Server Action: Create a new course workspace for the authenticated student.
 * Enforces schema validation and free-tier course limits.
 */
export async function createCourse(
  input: CreateCourseInput
): Promise<ActionResult<{ id: string }>> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to create a course.",
    };
  }

  // 1. Zod Validation
  const parsed = createCourseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid course details. Please correct the highlighted errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Enforce Free Tier Quota
    const existing = await db
      .select({ value: count() })
      .from(courses)
      .where(eq(courses.userId, session.user.id));

    const totalCourses = existing[0]?.value ?? 0;
    if (totalCourses >= MAX_FREE_COURSES) {
      return {
        success: false,
        error: `You have reached the Free Tier limit of ${MAX_FREE_COURSES} active courses. Delete an unused course to add another.`,
      };
    }

    // 3. Database Insertion
    const [inserted] = await db
      .insert(courses)
      .values({
        userId: session.user.id,
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        color: parsed.data.color,
      })
      .returning({ id: courses.id });

    // 4. Cache Revalidation
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { id: inserted.id },
    };
  } catch (error) {
    console.error("[createCourse] Database error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the course. Please try again.",
    };
  }
}

/**
 * Server Action: Update course title, description, or accent color.
 * Enforces user ownership.
 */
export async function updateCourse(
  input: UpdateCourseInput
): Promise<ActionResult<{ id: string }>> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to update a course.",
    };
  }

  // 1. Zod Validation
  const parsed = updateCourseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid course details. Please correct the highlighted errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Ownership check and update
    const [updated] = await db
      .update(courses)
      .set({
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        color: parsed.data.color,
        updatedAt: new Date(),
      })
      .where(
        and(eq(courses.id, parsed.data.id), eq(courses.userId, session.user.id))
      )
      .returning({ id: courses.id });

    if (!updated) {
      return {
        success: false,
        error: "Course not found or you do not have permission to edit it.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/courses/${parsed.data.id}`);

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (error) {
    console.error("[updateCourse] Database error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating the course.",
    };
  }
}

/**
 * Server Action: Delete a course and its associated documents, decks, and chats.
 */
export async function deleteCourse(
  courseId: string
): Promise<ActionResult<void>> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to delete a course.",
    };
  }

  try {
    const [deleted] = await db
      .delete(courses)
      .where(and(eq(courses.id, courseId), eq(courses.userId, session.user.id)))
      .returning({ id: courses.id });

    if (!deleted) {
      return {
        success: false,
        error: "Course not found or you do not have permission to delete it.",
      };
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("[deleteCourse] Database error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting the course.",
    };
  }
}
