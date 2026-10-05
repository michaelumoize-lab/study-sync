"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UserButton } from "@/components/auth/user/user-button";
import { useWorkspace } from "./workspace-context";

interface CoursesTopHeaderProps {
  courseTitle?: string;
}

export function CoursesTopHeader({ courseTitle }: CoursesTopHeaderProps) {
  const pathname = usePathname();
  const { courseTitle: contextTitle } = useWorkspace();
  const isWorkspace = pathname !== "/courses" && pathname.startsWith("/courses/");
  const displayTitle = courseTitle || contextTitle || "Workspace";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">StudySync</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isWorkspace ? (
                <BreadcrumbLink asChild>
                  <Link href="/courses">Courses</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>Courses</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {isWorkspace && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[180px] sm:max-w-[300px] truncate font-medium">
                    {displayTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <UserButton size="icon" />
      </div>
    </header>
  );
}
