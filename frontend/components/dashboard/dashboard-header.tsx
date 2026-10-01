import { CreateCourseDialog } from "./create-course-dialog";
import { GraduationCap } from "lucide-react";

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
  const quotaPercent = Math.min(100, Math.round((courseCount / maxCourses) * 100));

  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="size-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Study Workspace
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {displayName}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground">
          Select a course workspace to view documents, review flashcards, or ask grounded questions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Quota Indicator */}
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium">
              Free Tier Quota
            </span>
            <span className="font-semibold text-foreground">
              {courseCount} / {maxCourses} Courses
            </span>
          </div>

          <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>

        {/* New Course Modal Trigger */}
        <CreateCourseDialog courseCount={courseCount} maxCourses={maxCourses} />
      </div>
    </div>
  );
}
