import { CourseGridSkeleton } from "@/components/dashboard/course-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <CourseGridSkeleton />
    </main>
  );
}
