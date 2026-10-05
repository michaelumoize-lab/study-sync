"use client";

import { FileUp, Sparkles } from "lucide-react";
import { PdfUploadDialog } from "./pdf-upload-dialog";

interface DocumentsEmptyStateProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
}

export function DocumentsEmptyState({
  courseId,
  courseSlug,
  courseTitle,
}: DocumentsEmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/20 p-8 text-center sm:p-12 animate-in fade-in-50">
      <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <FileUp className="size-7" />
        <Sparkles className="absolute -top-1 -right-1 size-3.5 text-amber-400" />
      </div>

      <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
        No documents uploaded yet
      </h3>

      <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
        Upload your lecture slides, syllabus, or study PDFs (up to 50 MB) to power
        the AI Tutor, flashcards, and quizzes.
      </p>

      <div className="mt-5">
        <PdfUploadDialog
          courseId={courseId}
          courseSlug={courseSlug}
          courseTitle={courseTitle}
        />
      </div>
    </div>
  );
}
