import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getDashboardData } from "@/data/dashboard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ContinueStudying } from "@/components/dashboard/continue-studying";
import { CourseGrid } from "@/components/dashboard/course-grid";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { EmptyCourses } from "@/components/dashboard/empty-courses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "StudySync study dashboard. Continue your active study session, browse courses, and monitor recent learning progress.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?redirectTo=/dashboard");
  }

  // Fetch courses, continue-studying item, and recent activity via Data Access Layer
  const { courses, recentActivity, continueStudying } = await getDashboardData(
    session.user.id
  );

  return (
    <div className="mx-auto max-w-6xl mt-4 sm:mt-6 pb-20 sm:pb-28">
      <DashboardHeader
        user={session.user}
        courseCount={courses.length}
        maxCourses={5}
      />

      {courses.length === 0 ? (
        <EmptyCourses courseCount={0} />
      ) : (
        <div className="space-y-12 sm:space-y-16">
          {continueStudying && <ContinueStudying data={continueStudying} />}

          <CourseGrid courses={courses} maxCourses={5} />

          <RecentActivity
            activities={recentActivity}
            firstCourseSlug={courses[0]?.slug}
          />
        </div>
      )}
    </div>
  );
}