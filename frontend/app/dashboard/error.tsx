"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError] Uncaught dashboard error:", error);
  }, [error]);

  return (
    <main className="container mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="size-7" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Failed to load your study workspace
      </h2>

      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        We encountered an error loading your courses. This may be due to a
        temporary network glitch or database timeout.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RotateCcw className="size-4" />
          Try Again
        </Button>
      </div>
    </main>
  );
}
