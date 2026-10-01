"use client"

import { useState } from "react"
import {
  Sparkles,
  Check,
  RotateCw,
  FolderGit2,
  FileCheck,
  BookOpen,
  ArrowRight,
  Brain,
  HelpCircle,
  ShieldCheck,
  Flame,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function FeaturesBento() {
  const [cardFlipped, setCardFlipped] = useState(false)
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(1)

  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-24 sm:px-6">
      {/* Section Heading */}
      <div className="reveal mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium text-primary">
          Features
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Built so you actually retain
        </h2>
        <p className="mt-4 text-muted-foreground">
          StudySync transforms passive PDF reading into active, verifiable recall with slide citations, flashcards, and practice quizzes.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Grounded Citations (2 cols wide) */}
        <div className="md:col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 sm:p-8 transition-colors hover:border-primary/30">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="size-4" />
              <span>Grounded Retrieval</span>
            </div>
            <h3 className="mt-2 font-heading text-lg font-medium tracking-tight text-foreground sm:text-xl">
              Zero-Hallucination Answers with Slide Citations
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Every answer is synthesized strictly from your uploaded course slides and notes.
              Clickable citation chips quote the exact page and paragraph so you can verify in seconds.
            </p>
          </div>

          {/* Mock Citation UI Preview */}
          <div className="mt-6 rounded-xl border border-border/80 bg-background/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
              <span className="font-mono flex items-center gap-1.5 text-foreground">
                <FileCheck className="size-3.5 text-primary" />
                CS 240: Memory Hierarchy
              </span>
              <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                Verified Grounding
              </span>
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <div className="rounded-lg bg-card border border-border p-3 space-y-2">
                <p className="text-foreground/90">
                  <span className="font-semibold text-foreground">Spatial Locality</span> refers to accessing data elements that are physically stored near one another in memory.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 border border-primary/30 px-2 py-1 text-[11px] font-mono text-primary font-medium">
                    <BookOpen className="size-3" />
                    [Lecture 6, Slide 12: Cache Lines]
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary border border-border px-2 py-1 text-[11px] font-mono text-muted-foreground">
                    <BookOpen className="size-3" />
                    [Handout 3, Page 4]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 3D Active Recall Flashcards */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-7 transition-colors hover:border-primary/40">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <RotateCw className="size-4" />
              <span>Active Recall</span>
            </div>
            <h3 className="mt-2 font-heading text-xl font-semibold text-foreground">
              3D Interactive Flashcards
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Auto-generate 5, 10, or 20 cards directly from any lecture deck. Rate yourself Hard, Medium, or Easy.
            </p>
          </div>

          {/* Interactive Flashcard UI */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setCardFlipped(!cardFlipped)}
              className="w-full text-left group cursor-pointer rounded-xl border border-primary/30 bg-background/80 p-4 transition-all duration-300 hover:border-primary shadow-sm"
            >
              <span className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-2">
                <span className="font-mono text-primary font-medium">Card 4 of 10</span>
                <span className="flex items-center gap-1 text-[10px] uppercase font-semibold text-primary">
                  <RotateCw className="size-3 transition-transform group-hover:rotate-180 duration-500" />
                  Click to Flip
                </span>
              </span>

              <span className="py-4 min-h-[90px] flex items-center justify-center text-center">
                {!cardFlipped ? (
                  <span className="block text-xs sm:text-sm font-medium text-foreground">
                    What primary factor causes Translation Lookaside Buffer (TLB) thrashing?
                  </span>
                ) : (
                  <span className="block text-xs sm:text-sm text-primary font-medium">
                    When the working set of virtual pages exceeds the number of entries in the TLB.
                  </span>
                )}
              </span>

              <span className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/40 text-center text-[10px] font-mono">
                <span className="rounded bg-destructive/15 text-destructive font-medium py-1">Hard</span>
                <span className="rounded bg-secondary text-foreground font-medium py-1">Medium</span>
                <span className="rounded bg-primary/20 text-primary font-semibold py-1">Easy</span>
              </span>
            </button>

            {/* Deck Progress Bar */}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Deck Mastery</span>
              <span className="font-mono font-medium text-foreground">80% Mastered</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
              <div className="h-full w-4/5 rounded-full bg-primary" />
            </div>
          </div>
        </div>

        {/* Card 3: 4-Option MCQ Practice Quizzes */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-7 transition-colors hover:border-primary/40">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="size-4" />
              <span>Practice Testing</span>
            </div>
            <h3 className="mt-2 font-heading text-xl font-semibold text-foreground">
              Self-Scoring Practice Quizzes
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Test retention with 4-option multiple-choice questions. Get instant feedback and explanations.
            </p>
          </div>

          {/* Interactive MCQ Mock */}
          <div className="mt-6 rounded-xl border border-border/80 bg-background/80 p-4 space-y-2.5">
            <p className="text-xs font-medium text-foreground">
              Which page replacement policy minimizes theoretical misses?
            </p>

            <div className="space-y-1.5">
              {[
                { id: 0, text: "FIFO (First In First Out)", correct: false },
                { id: 1, text: "OPT (Bélády's Optimal)", correct: true },
                { id: 2, text: "LRU (Least Recently Used)", correct: false },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedQuizOption(opt.id)}
                  className={cn(
                    "w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between border cursor-pointer",
                    selectedQuizOption === opt.id && opt.correct
                      ? "border-primary bg-primary/15 text-foreground font-medium"
                      : selectedQuizOption === opt.id && !opt.correct
                      ? "border-destructive/60 bg-destructive/10 text-foreground"
                      : "border-border/60 bg-card hover:border-border"
                  )}
                >
                  <span>{opt.text}</span>
                  {selectedQuizOption === opt.id && opt.correct && (
                    <Check className="size-3.5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {selectedQuizOption === 1 && (
              <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                <span className="font-semibold text-primary">Correct:</span> OPT replaces the page that will not be used for the longest time in the future.
              </p>
            )}
          </div>
        </div>

        {/* Card 4: Course-Scoped Isolation (2 cols wide) */}
        <div className="md:col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 transition-colors hover:border-primary/40">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <FolderGit2 className="size-4" />
              <span>Tenant Security & Isolation</span>
            </div>
            <h3 className="mt-2 font-heading text-xl sm:text-2xl font-semibold text-foreground">
              Strict Course-Scoped Workspaces
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
              Your semester materials stay strictly partitioned. Retrieval queries for your Organic Chemistry midterm never bleed into your Algorithms problem sets.
            </p>
          </div>

          {/* Visual Isolated Course Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                code: "CS 240",
                title: "Operating Systems",
                docs: "14 documents",
                color: "border-primary/40 bg-primary/10",
              },
              {
                code: "BIOL 110",
                title: "Cellular Biology",
                docs: "8 documents",
                color: "border-border bg-secondary",
              },
              {
                code: "MATH 215",
                title: "Multivariable Calc",
                docs: "11 documents",
                color: "border-border bg-muted",
              },
            ].map((course) => (
              <div
                key={course.code}
                className={cn("rounded-xl border p-3.5 space-y-1.5 transition-colors", course.color)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {course.code}
                  </span>
                  <span className="size-2 rounded-full bg-primary" />
                </div>
                <p className="text-xs font-medium text-foreground truncate">{course.title}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{course.docs}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
