import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getCourseByIdOrSlug } from "@/data/courses";
import { getDocumentsForCourse } from "@/data/documents";
import { getThreadsForCourse } from "@/data/chat";
import { WorkspaceView } from "@/components/courses/workspace/workspace-view";
import { WorkspaceTitleSync } from "@/components/courses/workspace-context";
import type { Metadata } from "next";

interface CourseWorkspacePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CourseWorkspacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    return { title: "Course Workspace — StudySync" };
  }

  const course = await getCourseByIdOrSlug(slug, session.user.id);
  if (!course) {
    return { title: "Course Not Found — StudySync" };
  }

  return {
    title: `${course.title} — Study Workspace`,
    description:
      course.description ||
      `Study materials, flashcards, quizzes, and AI tutor for ${course.title}`,
  };
}

export default async function CourseWorkspacePage({
  params,
}: CourseWorkspacePageProps) {
  const { slug } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect(`/auth/sign-in?redirectTo=/courses/${slug}`);
  }

  const course = await getCourseByIdOrSlug(slug, session.user.id);

  if (!course) {
    notFound();
  }

  const [documents, initialThreads] = await Promise.all([
    getDocumentsForCourse(course.id, session.user.id),
    getThreadsForCourse(course.id, session.user.id),
  ]);

  return (
    <>
      <WorkspaceTitleSync title={course.title} />
      <WorkspaceView
        course={course}
        documents={documents}
        initialThreads={initialThreads}
      />
    </>
  );
}
