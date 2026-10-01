import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getCoursesForUser } from "@/data/courses";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseGrid } from "@/components/dashboard/course-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Dashboard",
  description:
    "Manage your courses, view uploaded lecture slides, review flashcards, and practice with grounded quizzes.",
};

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?redirectTo=/dashboard");
  }

  // Fetch courses and metrics via Data Access Layer
  const courses = await getCoursesForUser(session.user.id);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 flex-1">
      <DashboardHeader
        user={session.user}
        courseCount={courses.length}
        maxCourses={5}
      />

      <CourseGrid courses={courses} />
    </main>
  );
}