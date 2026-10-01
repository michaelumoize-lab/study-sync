import { Monitor, Smartphone, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const desktopFeatures = [
  "High-throughput PDF slide uploads up to 50MB with instant pre-flight checks",
  "Side-by-side slide inspection with interactive citation drawers",
  "Multi-threaded grounded chat sessions for deep lecture inquiry",
  "Comprehensive flashcard deck customization (5, 10, or 20 cards)",
]

const mobileFeatures = [
  "Full-viewport 3D flashcard flipping optimized for one-thumb active recall",
  "Quick 5-minute practice quizzes between classes or on the campus bus",
  "Rapid syllabus lookups before stepping into your midterm",
  "Zero latency state synchronization with your desktop workspace",
]

export function SurfacesShowcase() {
  return (
    <section className="mx-auto max-w-6xl scroll-mt-8 px-4 py-24 sm:px-6">
      <div className="reveal mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium text-primary">
          Surfaces
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Engineered for both surfaces
        </h2>
        <p className="mt-4 text-muted-foreground">
          Manage your course materials at your library desk. Drill flashcards and practice quizzes anywhere from your phone.
        </p>
      </div>

      <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Desktop Surface Card */}
        <div className="rounded-2xl border bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Monitor className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Desktop Surface
                  </h3>
                  <p className="text-xs text-muted-foreground">The Command & Creation Center</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
                Management
              </Badge>
            </div>

            <ul className="mt-6 flex flex-col gap-3.5">
              {desktopFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary mt-0.5">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-xl border border-border/80 bg-background/60 p-3 text-center text-xs font-mono text-muted-foreground">
            Optimized for: Chrome, Firefox, Safari & Edge on macOS & Windows
          </div>
        </div>

        {/* Mobile Surface Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Smartphone className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Mobile Surface
                  </h3>
                  <p className="text-xs text-muted-foreground">The Active Recall Companion</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
                Active Study
              </Badge>
            </div>

            <ul className="mt-6 flex flex-col gap-3.5">
              {mobileFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary mt-0.5">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-xl border border-border/80 bg-background/60 p-3 text-center text-xs font-mono text-muted-foreground">
            Responsive PWA & Mobile Web on iOS & Android
          </div>
        </div>
      </div>
    </section>
  )
}
