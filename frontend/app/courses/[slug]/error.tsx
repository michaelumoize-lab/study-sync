"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function WorkspaceError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Workspace page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[400px] max-w-lg flex-col items-center justify-center p-6 text-center animate-in fade-in-50">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="size-7" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Workspace Error
      </h2>

      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {error.message ||
          "Could not load the course workspace. The course may have been removed or you might need to re-authenticate."}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={() => reset()}
          variant="outline"
          className="gap-2 rounded-xl text-xs font-semibold"
        >
          <RefreshCw className="size-3.5" />
          <span>Try Again</span>
        </Button>

        <Button asChild className="gap-2 rounded-xl text-xs font-semibold">
          <Link href="/courses">
            <ArrowLeft className="size-3.5" />
            <span>Back to Courses</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
