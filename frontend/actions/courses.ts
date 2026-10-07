"use server";

import { getServerSession } from "@/lib/get-session";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { count, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUniqueCourseSlug } from "@/lib/slug";
import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/types/course";
import type { ActionResult } from "@/types/action-result";

const MAX_FREE_COURSES = 5;

interface DbErrorLike {
  code?: string;
  constraint?: string;
  message?: string;
  detail?: string;
  cause?: DbErrorLike;
}

function isSlugUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as DbErrorLike;
  const code = err.code ?? err.cause?.code;
  if (code !== "23505") return false;
  const constraint = String(err.constraint ?? err.cause?.constraint ?? "");
  const message = String(err.message ?? err.cause?.message ?? "");
  const detail = String(err.detail ?? err.cause?.detail ?? "");
  return (
    constraint.includes("courses_user_slug_idx") ||
    message.includes("courses_user_slug_idx") ||
    detail.includes("courses_user_slug_idx")
  );
}

/**
 * Server Action: Create a new course workspace for the authenticated student.
 * Enforces schema validation, free-tier course limits, and generates human-readable unique slug.
 */
export async function createCourse(
  input: CreateCourseInput
): Promise<ActionResult<{ id: string; slug: string }>> {
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

    const MAX_RETRIES = 3;
    let inserted: { id: string; slug: string } | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // 3. Generate human-readable unique slug for this user
        const slug = await getUniqueCourseSlug(
          parsed.data.title.trim(),
          session.user.id
        );

        // 4. Database Insertion
        const [row] = await db
          .insert(courses)
          .values({
            userId: session.user.id,
            title: parsed.data.title.trim(),
            slug,
            description: parsed.data.description?.trim() || null,
            color: parsed.data.color,
          })
          .returning({ id: courses.id, slug: courses.slug });

        inserted = row;
        break;
      } catch (err) {
        if (isSlugUniqueViolation(err) && attempt < MAX_RETRIES - 1) {
          continue;
        }
        throw err;
      }
    }

    if (!inserted) {
      return {
        success: false,
        error: "An unexpected error occurred while creating the course. Please try again.",
      };
    }

    // 5. Cache Revalidation
    revalidatePath("/dashboard");
    revalidatePath("/courses");

    return {
      success: true,
      data: { id: inserted.id, slug: inserted.slug },
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
 * Enforces user ownership and updates slug if title is modified.
 */
export async function updateCourse(
  input: UpdateCourseInput
): Promise<ActionResult<{ id: string; slug: string }>> {
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
    // 2. Check current course
    const existing = await db.query.courses.findFirst({
      where: and(eq(courses.id, parsed.data.id), eq(courses.userId, session.user.id)),
      columns: { id: true, title: true, slug: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Course not found or you do not have permission to edit it.",
      };
    }

    const MAX_RETRIES = 3;
    let updated: { id: string; slug: string } | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // 3. If title changed, generate updated unique slug
        let updatedSlug = existing.slug;
        if (parsed.data.title.trim() !== existing.title) {
          updatedSlug = await getUniqueCourseSlug(
            parsed.data.title.trim(),
            session.user.id,
            parsed.data.id
          );
        }

        // 4. Ownership check and update
        const [row] = await db
          .update(courses)
          .set({
            title: parsed.data.title.trim(),
            slug: updatedSlug,
            description: parsed.data.description?.trim() || null,
            color: parsed.data.color,
            updatedAt: new Date(),
          })
          .where(
            and(eq(courses.id, parsed.data.id), eq(courses.userId, session.user.id))
          )
          .returning({ id: courses.id, slug: courses.slug });

        updated = row;
        break;
      } catch (err) {
        if (isSlugUniqueViolation(err) && attempt < MAX_RETRIES - 1) {
          continue;
        }
        throw err;
      }
    }

    if (!updated) {
      return {
        success: false,
        error: "Course not found or you do not have permission to edit it.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${existing.slug}`);
    if (updated.slug !== existing.slug) {
      revalidatePath(`/courses/${updated.slug}`);
    }

    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
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
    revalidatePath("/courses");

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
