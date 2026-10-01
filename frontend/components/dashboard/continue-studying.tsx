"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Compass, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContinueStudyingData } from "@/data/dashboard";

interface ContinueStudyingProps {
  data: ContinueStudyingData | null;
}

export function ContinueStudying({ data }: ContinueStudyingProps) {
  if (!data) {
    return null;
  }

  const formattedTime = formatDistanceToNow(new Date(data.timestamp), {
    addSuffix: true,
  });

  return (
    <section className="mb-12 sm:mb-14 space-y-4" aria-labelledby="continue-studying-heading">
      <div className="flex items-center gap-2">
        <Compass className="size-4 text-primary" />
        <h2
          id="continue-studying-heading"
          className="text-sm font-semibold tracking-tight text-muted-foreground uppercase"
        >
          Continue Studying
        </h2>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-7 shadow-xs transition-all duration-200 hover:border-border hover:shadow-md">
        {/* Course Color Left Accent Indicator */}
        <div
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundColor: data.courseColor }}
        />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 pl-2 sm:pl-3">
            <div className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: data.courseColor }}
              />
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {data.courseTitle}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground line-clamp-1">
              {data.activityTitle}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground">
              {data.isInitialCourse ? (
                <span>Ready to start • Upload your lecture notes and slides</span>
              ) : (
                <span>Continue where you left off • Last active {formattedTime}</span>
              )}
            </p>
          </div>

          <div className="shrink-0 pl-2 sm:pl-0">
            <Button
              asChild
              className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-xs transition-all hover:gap-2.5 gap-2"
            >
              <Link href={data.href}>
                <span>{data.isInitialCourse ? "Open Workspace" : "Continue Studying"}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
