"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  MessageSquare,
  Layers,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Clock,
  Activity,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardActivityItem } from "@/data/dashboard";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  activities: DashboardActivityItem[];
  firstCourseSlug?: string;
  firstCourseId?: string;
}

export function RecentActivity({
  activities,
  firstCourseSlug,
  firstCourseId,
}: RecentActivityProps) {
  const getActivityIcon = (type: DashboardActivityItem["type"]) => {
    switch (type) {
      case "document":
        return <FileText className="size-4 text-blue-400" />;
      case "chat":
        return <MessageSquare className="size-4 text-emerald-400" />;
      case "flashcard":
        return <Layers className="size-4 text-purple-400" />;
      case "quiz":
        return <HelpCircle className="size-4 text-amber-400" />;
      case "course":
      default:
        return <BookOpen className="size-4 text-primary" />;
    }
  };

  const getActivityBadgeColor = (type: DashboardActivityItem["type"]) => {
    switch (type) {
      case "document":
        return "bg-blue-500/10 border-blue-500/20";
      case "chat":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "flashcard":
        return "bg-purple-500/10 border-purple-500/20";
      case "quiz":
        return "bg-amber-500/10 border-amber-500/20";
      case "course":
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  return (
    <section className="mt-8 sm:mt-12 mb-16 sm:mb-20 space-y-6" aria-labelledby="recent-activity-heading">
      <div className="flex items-center gap-2.5">
        <Activity className="size-4 text-primary" />
        <h2
          id="recent-activity-heading"
          className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          Recent Activity
        </h2>
      </div>

      {activities.length > 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 divide-y divide-border/30 overflow-hidden shadow-xs">
          {activities.map((item) => {
            const relativeTime = formatDistanceToNow(new Date(item.timestamp), {
              addSuffix: true,
            });

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                      getActivityBadgeColor(item.type)
                    )}
                  >
                    {getActivityIcon(item.type)}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        {item.detail}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.courseColor }}
                        />
                        {item.courseTitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground pl-12.5 sm:pl-0 shrink-0">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="size-3" />
                    {relativeTime}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/20 p-8 text-center sm:p-10">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-3">
            <Upload className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No recent activity yet
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Start by uploading study materials, slides, or syllabus notes to one of your courses.
          </p>
          {(firstCourseSlug || firstCourseId) && (
            <div className="mt-5">
              <Button asChild size="sm" variant="outline" className="gap-2 rounded-xl text-xs font-semibold">
                <Link href={`/courses/${firstCourseSlug || firstCourseId}`}>
                  <span>Open Your Course</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
