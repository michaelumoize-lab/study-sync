import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in-50">
      {/* Header skeleton */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <Skeleton className="h-7 w-28 rounded-xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-3.5 rounded-full" />
              <Skeleton className="h-8 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-96 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tabs list skeleton */}
      <div className="flex items-center gap-4 border-b border-border/40 pb-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border/50 bg-card/40 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-7 w-12 rounded" />
              <Skeleton className="h-3 w-20 rounded mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Action tiles skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card/40 p-5 space-y-3"
          >
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
