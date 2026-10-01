import { HeroVideo } from "./hero-video"

const steps = [
  {
    title: "Upload your course slides",
    description: "Drop in lecture PDFs, syllabi, or handouts up to 50MB. Verified instantly.",
  },
  {
    title: "Page-bounded indexing",
    description: "StudySync extracts text page-by-page, chunking every concept into isolated course vectors.",
  },
  {
    title: "Master with active recall",
    description: "Drill 3D flashcards, take self-scoring practice quizzes, and get answers cited against your slides.",
  },
]

export function HowItWorks() {
  return (
    // From lg up the height tracks the width, so the character and the stairs keep their spot beside the text.
    <section id="how-it-works" className="relative isolate flex scroll-mt-8 flex-col lg:h-[clamp(36rem,56.25vw,64rem)] lg:justify-center">
      {/* The scene sits right of the text. Below lg it becomes a strip under the steps so it never sits behind text. */}
      <HeroVideo
        name="path-scene"
        className="object-[80%_50%] mask-t-from-92% mask-b-from-75% max-lg:top-auto max-lg:h-96 max-lg:mask-t-from-85%"
      />
      <div className="reveal mx-auto w-full max-w-6xl px-4 pt-24 pb-96 sm:px-6 lg:py-0">
        <div className="max-w-md">
          <p className="mb-3 text-sm font-medium text-primary">How it works</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            From raw slides to <span className="text-gradient">exam mastery</span>
          </h2>
          <ol className="mt-10 flex flex-col gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="relative flex gap-4">
                {/* A hairline down to the next step's number, like the stairs in the scene. */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-10 -bottom-6 left-4 w-px bg-linear-to-b from-primary/40 to-transparent"
                  />
                )}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs text-primary backdrop-blur">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-heading text-lg font-medium tracking-tight">{s.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
