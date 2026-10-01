import { CourseGridSkeleton } from "@/components/dashboard/course-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl mt-4 sm:mt-6 pb-20 sm:pb-28">
      {/* 1. Header Skeleton */}
      <div className="mb-10 sm:mb-12 flex flex-col justify-between gap-4 border-b border-border/40 pb-6 sm:pb-8 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      <div className="space-y-12 sm:space-y-16">
        {/* 2. Continue Studying Skeleton Card */}
        <div className="mb-12 sm:mb-14 space-y-4">
          <Skeleton className="h-4 w-36 rounded-md" />
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2.5">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-7 w-64 rounded-lg" />
                <Skeleton className="h-4 w-52 rounded-md" />
              </div>
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 3. Course Grid Skeleton */}
        <div className="mb-14 sm:mb-16">
          <CourseGridSkeleton />
        </div>

        {/* 4. Recent Activity Skeleton */}
        <div className="mt-8 sm:mt-12 mb-16 sm:mb-20 space-y-6">
        <Skeleton className="h-5 w-36 rounded-md" />
        <div className="rounded-2xl border border-border/60 bg-card/40 p-4 divide-y divide-border/30 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between pt-3 first:pt-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48 rounded-md" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
