import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { HeroVideo } from "./hero-video"

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="reveal relative isolate overflow-hidden rounded-3xl border bg-card px-6 pt-20 pb-56 text-center sm:pt-24 sm:pb-64">
        {/* Pushed down a quarter so the sunrise lands under the buttons; the mask melts its top edge into the card. */}
        <HeroVideo name="cta-globe" className="top-1/4 mask-t-from-60%" />
        <h2 className="mx-auto max-w-2xl font-heading text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Your exam prep <span className="text-gradient">starts today</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Upload your lecture slides, ask grounded questions, and drill active-recall flashcards. 100% free.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/sign-in" className={buttonVariants({ size: "xl" })}>
            Get Started <ArrowRight className="size-4" />
          </Link>
          <Link href="/#features" className={buttonVariants({ variant: "outline", size: "xl" })}>
            Explore Features
          </Link>
        </div>
      </div>
    </section>
  )
}
