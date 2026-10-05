import { CreateCourseDialog } from "@/components/dashboard/create-course-dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface CoursesHeaderProps {
  courseCount: number;
  maxCourses?: number;
}

export function CoursesHeader({
  courseCount,
  maxCourses = 5,
}: CoursesHeaderProps) {
  const isNearLimit = courseCount >= maxCourses;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Courses
            </h1>
          </div>
          <Badge
            variant="outline"
            className={
              isNearLimit
                ? "border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs"
                : "border-border/60 bg-muted/50 text-muted-foreground text-xs"
            }
          >
            {courseCount} of {maxCourses} courses used
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground pl-12">
          Organize your study workspaces, lecture notes, flashcards, and quizzes.
        </p>
      </div>

      <div className="flex items-center gap-3 sm:self-center">
        <CreateCourseDialog courseCount={courseCount} maxCourses={maxCourses} />
      </div>
    </div>
  );
}
