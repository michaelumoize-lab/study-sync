import { z } from "zod";

/**
 * Curated accessible palette of course accent colors for subject distinction.
 */
export const COURSE_COLOR_PRESETS = [
  { name: "Ocean Blue", value: "#3b82f6" },
  { name: "Emerald Green", value: "#10b981" },
  { name: "Violet Purple", value: "#8b5cf6" },
  { name: "Sunset Amber", value: "#f59e0b" },
  { name: "Rose Pink", value: "#f43f5e" },
  { name: "Cyan Teal", value: "#06b6d4" },
  { name: "Indigo Night", value: "#6366f1" },
  { name: "Crimson Red", value: "#ef4444" },
] as const;

export const DEFAULT_COURSE_COLOR: string = COURSE_COLOR_PRESETS[0].value;

/**
 * Zod schema for validating course creation.
 */
export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Course title must be at least 2 characters." })
    .max(80, { message: "Course title cannot exceed 80 characters." }),
  description: z
    .string()
    .trim()
    .max(300, { message: "Description cannot exceed 300 characters." })
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
      message: "Please choose a valid accent color.",
    })
    .default(DEFAULT_COURSE_COLOR),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

/**
 * Zod schema for updating an existing course.
 */
export const updateCourseSchema = createCourseSchema.extend({
  id: z.string().uuid({ message: "Invalid course ID." }),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

/**
 * DTO for a course with attached summary metrics.
 */
export interface CourseWithStats {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    documentCount: number;
    deckCount: number;
    quizCount: number;
    threadCount: number;
  };
}
