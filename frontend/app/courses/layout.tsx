import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CoursesTopHeader } from "@/components/courses/courses-top-header";
import { WorkspaceProvider } from "@/components/courses/workspace-context";

export const metadata: Metadata = {
  title: "Courses — StudySync",
  description: "Browse and manage your active course study workspaces.",
  robots: { index: false, follow: false },
};

export default async function CoursesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?redirectTo=/courses");
  }

  return (
    <TooltipProvider delayDuration={0}>
      <WorkspaceProvider>
        <SidebarProvider>
          <AppSidebar user={session.user} />
          <SidebarInset className="flex h-screen flex-col overflow-hidden bg-background">
            <CoursesTopHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </WorkspaceProvider>
    </TooltipProvider>
  );
}
