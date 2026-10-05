import { FileText, Layers, HelpCircle, MessageSquare } from "lucide-react";
import type { CourseWithStats } from "@/types/course";

interface WorkspaceStatsProps {
  course: CourseWithStats;
}

export function WorkspaceStats({ course }: WorkspaceStatsProps) {
  const stats = [
    {
      label: "Course Documents",
      value: course.stats.documentCount,
      sublabel: `${course.stats.documentCount === 1 ? "document" : "documents"} indexed`,
      icon: FileText,
      iconColor: "text-blue-400 bg-blue-400/10",
    },
    {
      label: "Flashcard Decks",
      value: course.stats.deckCount,
      sublabel: `${course.stats.deckCount === 1 ? "deck" : "decks"} created`,
      icon: Layers,
      iconColor: "text-purple-400 bg-purple-400/10",
    },
    {
      label: "Practice Quizzes",
      value: course.stats.quizCount,
      sublabel: `${course.stats.quizCount === 1 ? "quiz" : "quizzes"} generated`,
      icon: HelpCircle,
      iconColor: "text-emerald-400 bg-emerald-400/10",
    },
    {
      label: "AI Discussions",
      value: course.stats.threadCount,
      sublabel: `${course.stats.threadCount === 1 ? "thread" : "threads"} active`,
      icon: MessageSquare,
      iconColor: "text-amber-400 bg-amber-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/50 p-4 transition-all hover:border-border/90 hover:bg-card/80 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div
                className={`flex size-8 items-center justify-center rounded-lg ${stat.iconColor}`}
              >
                <Icon className="size-4" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stat.sublabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
