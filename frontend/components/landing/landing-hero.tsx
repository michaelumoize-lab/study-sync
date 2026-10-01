import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HeroVideo } from "./hero-video"

const rise = "motion-safe:animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"

const avatars = [
  "/avatars/maya.jpg",
  "/avatars/daniel.jpg",
  "/avatars/sofia.jpg",
  "/avatars/arjun.jpg",
  "/avatars/hana.jpg",
]

export function LandingHero() {
  return (
    <section className="relative isolate -mt-18 flex min-h-svh flex-col items-center justify-center px-4 pt-32 pb-24 text-center sm:px-6">
      {/* Background ambient video scene */}
      <HeroVideo name="hero-globe" />

      {/* Radial overlay from course-platform */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_38rem_24rem_at_50%_52%,rgb(5_6_15/0.85)_35%,rgb(5_6_15/0.55)_65%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-background to-transparent"
      />

      {/* Eyebrow Badge */}
      <Badge
        variant="outline"
        className={cn(
          rise,
          "h-8 gap-2 border-primary/30 bg-primary/10 px-3 text-sm text-foreground backdrop-blur [&>svg]:size-4!"
        )}
      >
        <Sparkles className="text-primary" />
        <span>100% Grounded in Your Course Materials</span>
      </Badge>

      {/* Main Headline */}
      <h1
        className={cn(
          rise,
          "mt-6 font-heading text-5xl leading-[1.05] font-semibold tracking-[-0.04em] delay-100 sm:text-6xl lg:text-7xl"
        )}
      >
        Turn Course Materials Into{" "}
        <span className="text-gradient">Exam Mastery</span>
      </h1>

      {/* Supporting Copy */}
      <p
        className={cn(
          rise,
          "mt-6 max-w-xl text-base text-foreground/80 delay-200 sm:text-lg"
        )}
      >
        Stop guessing and hallucinating. Upload your lecture slides, handouts, and notes to
        get instant cited answers, active-recall flashcards, and exam-grade practice quizzes.
      </p>

      {/* Action Buttons */}
      <div
        className={cn(
          rise,
          "mt-10 flex flex-col gap-3 delay-300 sm:flex-row"
        )}
      >
        <Link
          href="/sign-in"
          className={buttonVariants({ size: "xl" })}
        >
          Start Studying Free
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/#how-it-works"
          className={buttonVariants({ variant: "outline", size: "xl" })}
        >
          See How It Works
        </Link>
      </div>

      {/* Social Proof Strip */}
      <div
        className={cn(
          rise,
          "mt-10 flex items-center gap-3 delay-500"
        )}
      >
        <div className="flex -space-x-2">
          {avatars.map((src, i) => (
            <div
              key={src}
              className="relative size-8 rounded-full ring-2 ring-background overflow-hidden bg-muted"
            >
              <Image
                src={src}
                alt="Student user"
                fill
                sizes="32px"
                className="object-cover"
                priority={i < 2}
              />
            </div>
          ))}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-current" />
            ))}
          </div>
          <p className="mt-1 text-xs text-foreground/70">
            Trusted by students across STEM, Medicine & Law
          </p>
        </div>
      </div>
    </section>
  )
}
