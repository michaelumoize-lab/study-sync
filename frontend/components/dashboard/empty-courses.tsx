"use client";

import { CreateCourseDialog } from "./create-course-dialog";
import { BookOpen, Sparkles, FileUp, BrainCircuit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyCoursesProps {
  courseCount: number;
}

export function EmptyCourses({ courseCount }: EmptyCoursesProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/30 p-8 text-center sm:p-14">
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10 bg-radial from-primary/5 via-transparent to-transparent opacity-60" />

      <div className="mx-auto flex max-w-lg flex-col items-center">
        {/* Book / Graduation Icon */}
        <div className="relative mb-6 flex size-18 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5 shadow-xs">
          <BookOpen className="size-9" />
          <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="size-3.5" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Start your first course
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md">
          Upload your lecture material and turn it into an interactive study workspace.
        </p>

        <div className="mt-7">
          <CreateCourseDialog
            courseCount={courseCount}
            trigger={
              <Button
                size="lg"
                className="gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                <Plus className="size-4" />
                <span>Create Your First Course</span>
              </Button>
            }
          />
        </div>

        {/* 3 Step Highlights */}
        <div className="mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 text-left">
          <div className="flex flex-col gap-1.5 rounded-xl border border-border/40 bg-background/50 p-4 shadow-xs">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <FileUp className="size-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              1. Upload Course PDFs
            </span>
            <span className="text-[11px] text-muted-foreground leading-normal">
              Direct R2 ingestion with layout-aware text chunking.
            </span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-xl border border-border/40 bg-background/50 p-4 shadow-xs">
            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <BrainCircuit className="size-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              2. Grounded AI Tutor
            </span>
            <span className="text-[11px] text-muted-foreground leading-normal">
              Inline page citations verify every concept directly.
            </span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-xl border border-border/40 bg-background/50 p-4 shadow-xs">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="size-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              3. Cited Practice Tests
            </span>
            <span className="text-[11px] text-muted-foreground leading-normal">
              AI-generated flashcards and multiple-choice quizzes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
