"use client";

import { BookOpen, Plus, Sparkles } from "lucide-react";
import { CreateCourseDialog } from "@/components/dashboard/create-course-dialog";
import { Button } from "@/components/ui/button";

export function CoursesEmptyState() {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-8 text-center sm:p-12 animate-in fade-in-50">
      <div className="relative mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <BookOpen className="size-8" />
        <Sparkles className="absolute -top-1 -right-1 size-4 text-amber-400" />
      </div>

      <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        No courses created yet
      </h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        Start by creating your first course workspace. Upload lecture PDFs, talk
        with your AI study tutor, and generate flashcards and practice quizzes.
      </p>

      <div className="mt-6">
        <CreateCourseDialog
          courseCount={0}
          trigger={
            <Button className="gap-2 rounded-xl px-5 font-semibold shadow-xs">
              <Plus className="size-4" />
              <span>Create Your First Course</span>
            </Button>
          }
        />
      </div>
    </div>
  );
}
