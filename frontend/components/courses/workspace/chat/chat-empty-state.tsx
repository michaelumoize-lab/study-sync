"use client";

import { Sparkles, AlertCircle, ArrowRight, Lightbulb, FileUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PdfUploadDialog } from "@/components/courses/workspace/pdf-upload-dialog";
import type { DocumentItem } from "@/types/document";

interface ChatEmptyStateProps {
  courseTitle: string;
  courseId: string;
  courseSlug: string;
  documents: DocumentItem[];
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    title: "Summarize Core Concepts",
    description: "Synthesize the central themes and definitions from uploaded slides.",
    prompt: "Summarize the core concepts and fundamental themes from our course materials.",
  },
  {
    title: "Step-by-Step Derivation",
    description: "Clarify a complex formula, theorem, or computational algorithm.",
    prompt: "Explain the key formulas and algorithms covered in the materials step-by-step with an example.",
  },
  {
    title: "Active Recall Diagnostic",
    description: "Test your understanding with 3 high-yield questions with explanations.",
    prompt: "Quiz me on 3 fundamental concepts from this course. Provide questions first, then give the solutions.",
  },
  {
    title: "Exam Preparation Review",
    description: "Identify high-yield exam topics and frequently tested definitions.",
    prompt: "What are the highest-yield topics and key definitions most likely to be tested on an exam?",
  },
];

export function ChatEmptyState({
  courseTitle,
  courseId,
  courseSlug,
  documents,
  onSelectPrompt,
}: ChatEmptyStateProps) {
  const readyDocs = documents.filter((d) => d.status === "READY");
  const hasDocs = readyDocs.length > 0;

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8 text-center space-y-6">
      {/* Icon Badge */}
      <div className="relative">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
          <Sparkles className="size-7" />
        </div>
      </div>

      {/* Greeting & Subtitle */}
      <div className="space-y-2 max-w-lg">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Study with {courseTitle} AI Tutor
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ask questions about your lecture slides, problem sets, and syllabus. Answers are
          grounded directly in your uploaded materials with exact page citations.
        </p>
      </div>

      {/* Zero Documents Warning Banner */}
      {!hasDocs && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-left">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                No course materials indexed yet
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Answers will rely on universal academic knowledge until you upload lecture slides.
              </p>
            </div>
          </div>

          <PdfUploadDialog
            courseId={courseId}
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 shrink-0 border-amber-500/40 hover:bg-amber-500/10"
              >
                <FileUp className="size-3.5 text-amber-500" />
                <span>Upload PDF</span>
              </Button>
            }
          />
        </div>
      )}

      {/* Starter Prompts Grid */}
      <div className="w-full space-y-2 text-left">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          <Lightbulb className="size-3 text-amber-400" />
          <span>Suggested Study Starters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {STARTER_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-border/70 bg-card/50 hover:bg-accent/60 hover:border-amber-500/40 text-left transition-all duration-150 shadow-2xs hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="size-3 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
