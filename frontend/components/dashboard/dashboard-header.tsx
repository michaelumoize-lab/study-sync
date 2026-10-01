"use client";

import { CreateCourseDialog } from "./create-course-dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email: string;
  };
  courseCount: number;
  maxCourses?: number;
}

export function DashboardHeader({
  user,
  courseCount,
  maxCourses = 5,
}: DashboardHeaderProps) {
  const displayName = user.name || user.email.split("@")[0];

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();
  const isAtQuota = courseCount >= maxCourses;

  return (
    <div className="mb-10 sm:mb-12 flex flex-col justify-between gap-4 border-b border-border/40 pb-6 sm:pb-8 sm:flex-row sm:items-end">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {displayName} 👋
        </h1>

        <p className="text-sm text-muted-foreground">
          Ready to continue studying?
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Course Quota Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          <span>Active Courses:</span>
          <span className="font-semibold text-foreground">
            {courseCount} / {maxCourses}
          </span>
        </div>

        {/* Primary CTA: Create Course */}
        <CreateCourseDialog
          courseCount={courseCount}
          maxCourses={maxCourses}
          trigger={
            <Button
              disabled={isAtQuota}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span>Create Course</span>
            </Button>
          }
        />
      </div>
    </div>
  );
}
