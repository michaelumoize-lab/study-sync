import { BookOpen, Check, Sparkles, ArrowUp } from "lucide-react"
import { HeroVideo } from "./hero-video"

const tutorPoints = [
  "Synthesizes answers directly from your course slides, handouts, and notes",
  "Cites exact slide numbers and paragraphs for every answer",
  "Explains complex formulas, code snippets, and diagrams step-by-step",
  "Available 24/7 on desktop and mobile for late-night study sessions",
]

export function TutorSpotlight() {
  return (
    <section
      id="tutor"
      className="mx-auto grid max-w-6xl scroll-mt-8 grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16"
    >
      {/* Left Column: Copy & Value Propositions */}
      <div className="reveal">
        <p className="mb-3 text-sm font-medium text-primary">
          AI tutor
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Stuck on a lecture? <span className="text-gradient">Just ask</span>
        </h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          Every course comes with a tutor that has read your syllabus and slide decks, so its answers are about the exact material on your screen.
        </p>

        <ul className="mt-8 flex flex-col gap-3.5">
          {tutorPoints.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-foreground/90">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary mt-0.5">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: tutor-bulb ambient video with floating interactive mock */}
      <div className="reveal">
        <div className="relative isolate aspect-square overflow-hidden rounded-3xl border border-border bg-card">
          <HeroVideo name="tutor-bulb" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent to-background/60"
          />
        </div>

        {/* Floating "Ask StudySync" Card pulled up over the video */}
        <div className="relative mx-3 sm:mx-8 -mt-32 rounded-2xl border border-border/80 bg-card/85 p-4 sm:p-5 text-sm backdrop-blur-md shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>Grounded Course Tutor</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">CS 240 · Lec 08</span>
          </div>

          <div className="space-y-2.5">
            {/* Student Message */}
            <div className="flex justify-end">
              <p className="rounded-xl rounded-tr-sm bg-primary/15 border border-primary/25 px-3 py-2 text-xs text-foreground max-w-[90%]">
                How does a Translation Lookaside Buffer (TLB) prevent a memory penalty?
              </p>
            </div>

            {/* Citation Pill */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="size-3.5 text-primary" />
              <span>Read “Lec 08: Memory Hierarchy, Slide 18”</span>
            </div>

            {/* AI Grounded Response */}
            <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/50 rounded-xl p-3">
              The TLB is an on-chip hardware cache of recent virtual-to-physical address
              translations. When a <span className="font-semibold text-primary">TLB hit</span> occurs,
              translation finishes in &lt;1 cycle—completely bypassing the multi-step page table
              walk in physical RAM.
            </p>
          </div>

          {/* Prompt Input Mock */}
          <div className="flex items-center gap-2 border-t border-border/50 pt-2.5">
            <span className="flex h-9 flex-1 items-center rounded-lg border border-input bg-background/70 px-3 text-xs text-muted-foreground">
              Ask about any lecture slide...
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ArrowUp className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
