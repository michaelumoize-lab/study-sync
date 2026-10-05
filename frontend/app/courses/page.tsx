import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getCoursesForUser } from "@/data/courses";
import { CoursesHeader } from "@/components/courses/courses-header";
import { CoursesListView } from "@/components/courses/courses-list-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses — StudySync",
  description: "Browse and organize your active course workspaces, study notes, and materials.",
};

export default async function CoursesPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?redirectTo=/courses");
  }

  const courses = await getCoursesForUser(session.user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <CoursesHeader courseCount={courses.length} />
      <CoursesListView initialCourses={courses} />
    </div>
  );
}
