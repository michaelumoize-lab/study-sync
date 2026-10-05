import { db } from "@/db";
import { courses } from "@/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";

/**
 * Converts a raw title into a clean, URL-safe slug.
 * e.g. "COMP440 Database Security!" -> "comp440-database-security"
 */
export function slugify(text: string): string {
  const slug = text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "course";
}

/**
 * Finds a unique slug for a given user.
 * If 'computer-networks' already exists for this user, increments to 'computer-networks-2', etc.
 */
export async function getUniqueCourseSlug(
  title: string,
  userId: string,
  excludeCourseId?: string
): Promise<string> {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.query.courses.findFirst({
      where: (table, { and, eq, ne }) => {
        const conditions = [eq(table.userId, userId), eq(table.slug, candidate)];
        if (excludeCourseId) {
          conditions.push(ne(table.id, excludeCourseId));
        }
        return and(...conditions);
      },
      columns: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
}
