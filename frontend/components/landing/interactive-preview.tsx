"use client"

import { useState } from "react"
import {
  FileText,
  Sparkles,
  BookOpen,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const rise = "motion-safe:animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"

export function InteractivePreview() {
  const [activeCitation, setActiveCitation] = useState<boolean>(true)

  return (
    <section className="relative mx-auto -mt-16 max-w-5xl px-4 sm:px-6">
      {/* Frame with top glowing edge & periwinkle glow shadow */}
      <div
        className={cn(
          rise,
          "relative rounded-2xl border bg-card/60 p-2 sm:p-3 shadow-[0_-10px_60px_-20px_var(--glow)] backdrop-blur delay-700"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[15%] -top-px h-px bg-linear-to-r from-transparent via-primary to-transparent"
        />

        {/* Mock Workspace Window Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 px-2 sm:px-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-2.5 rounded-full bg-destructive/60" />
            <span className="flex size-2.5 rounded-full bg-accent-foreground/30" />
            <span className="flex size-2.5 rounded-full bg-primary/60" />
            <span className="mx-2 h-3.5 w-px bg-border" />
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              CS 240: Operating Systems
            </span>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <span className="text-muted-foreground hidden sm:inline flex items-center gap-1">
              <FileText className="size-3 text-primary" />
              lec08_virtual_memory.pdf
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 border-primary/20 text-foreground text-[11px] font-mono font-normal"
            >
              14 Chunks Indexed
            </Badge>
            <Badge
              variant="secondary"
              className="text-[11px] font-mono text-muted-foreground hidden md:inline-flex"
            >
              pgvector: HNSW 768d
            </Badge>
          </div>
        </div>

        {/* Main Workspace Split Body */}
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[380px]">
          {/* Left Column: Lecture Slide View (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border bg-background/60 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-primary" />
                  Slide 14 of 42: Two-Level Page Tables
                </span>
                <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Source Document
                </span>
              </div>

              {/* Slide Schematic / Visual Breakdown */}
              <div className="rounded-lg border bg-card/80 p-3.5 space-y-3">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Virtual Address Translation Hierarchy</span>
                  <span className="text-[10px] font-mono text-muted-foreground">32-bit Architecture</span>
                </div>

                {/* Virtual Address Decomposition Diagram */}
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
                  <div className="rounded bg-primary/15 border border-primary/30 p-1.5">
                    <span className="block font-semibold text-primary">Directory (10b)</span>
                    <span className="text-[9px] text-muted-foreground">Root Index</span>
                  </div>
                  <div className="rounded bg-secondary border p-1.5">
                    <span className="block font-semibold text-foreground">Table (10b)</span>
                    <span className="text-[9px] text-muted-foreground">PTE Index</span>
                  </div>
                  <div className="rounded bg-muted border p-1.5">
                    <span className="block font-semibold text-foreground">Offset (12b)</span>
                    <span className="text-[9px] text-muted-foreground">Page Byte</span>
                  </div>
                </div>

                {/* Page Table Grounded Text Box */}
                <div
                  className={cn(
                    "rounded-md border p-2.5 text-xs transition-all duration-300",
                    activeCitation
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-[0_0_24px_-8px_var(--glow)]"
                      : "border-border/70 bg-background/70"
                  )}
                >
                  <p className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    Key Principle Cited by AI:
                  </p>
                  <p className="mt-1 text-muted-foreground leading-relaxed text-[11.5px]">
                    &ldquo;Unlike linear single-level page tables where entries must reside
                    continuously in memory, a two-level table allocates secondary tables on demand.
                    Unused address ranges require zero secondary page tables.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2 font-mono">
              <span>Section: Memory Management</span>
              <button
                type="button"
                onClick={() => setActiveCitation(!activeCitation)}
                className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {activeCitation ? "Citation Active" : "Click Citation in Chat"}
                <ExternalLink className="size-3" />
              </button>
            </div>
          </div>

          {/* Right Column: Grounded AI Chat with Slide Citations (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border bg-background/60 p-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b pb-2">
                <Sparkles className="size-3.5 text-primary" />
                <span>Grounded Course Tutor</span>
              </div>

              {/* Student Query Bubble */}
              <div className="flex justify-end">
                <div className="rounded-xl rounded-tr-sm bg-primary/15 border border-primary/25 px-3 py-2 text-xs text-foreground max-w-[90%] leading-relaxed">
                  Why do multi-level page tables save memory compared to single-level?
                </div>
              </div>

              {/* Grounded AI Answer with Interactive Citation Chip */}
              <div className="rounded-xl rounded-tl-sm bg-card border p-3 text-xs leading-relaxed space-y-2">
                <p className="text-foreground/90">
                  Because virtual memory is sparse! In a linear table, you must allocate entries for all 4GB of address space even if the program only uses 10MB.
                </p>
                <p className="text-foreground/90">
                  With multi-level tables, intermediate page directories remain unallocated until that memory range is actually mapped.
                </p>

                {/* Clickable Citation Chip */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveCitation(true)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono transition-all",
                      activeCitation
                        ? "bg-primary text-primary-foreground font-medium shadow-glow"
                        : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                    )}
                  >
                    <BookOpen className="size-3" />
                    <span>[Slide 14, ¶2]</span>
                    <span className="text-[10px] opacity-80">(Verified)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mock Prompt Input Bar */}
            <div className="mt-3 flex items-center gap-2 border-t pt-2.5">
              <div className="flex h-9 flex-1 items-center rounded-lg border border-input bg-card/60 px-3 text-xs text-muted-foreground">
                Ask anything about Lecture 08...
              </div>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
                <ArrowUp className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background to-transparent"
      />
    </section>
  )
}
