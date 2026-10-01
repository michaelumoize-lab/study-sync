import Image from "next/image"
import { Pause, Play, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

type Testimonial = {
  name: string
  major: string
  university: string
  avatar: string
  quote: string
}

const studentReviews: Testimonial[] = [
  {
    name: "Arjun Patel",
    major: "Computer Science Junior",
    university: "UC Berkeley",
    avatar: "/avatars/arjun.jpg",
    quote:
      "StudySync cited the exact slide in our Distributed Systems lecture notes where Paxos consensus was diagrammed. Saved my grade on the midterm.",
  },
  {
    name: "Maya Chen",
    major: "2nd Year Medical Student",
    university: "Johns Hopkins",
    avatar: "/avatars/maya.jpg",
    quote:
      "Active-recall flashcards generated directly from 80-page Pathology slide decks with zero hallucinations. It is like having a private tutor 24/7.",
  },
  {
    name: "Sofia Martínez",
    major: "Biochemistry Senior",
    university: "Univ. of Michigan",
    avatar: "/avatars/sofia.jpg",
    quote:
      "Our professor tests on tiny details on slide 47. Asking StudySync pulled the exact bullet point and enzyme pathway diagram immediately.",
  },
  {
    name: "Daniel Okafor",
    major: "Pre-Law & Philosophy",
    university: "Georgetown",
    avatar: "/avatars/daniel.jpg",
    quote:
      "I upload dense constitutional law case briefs and handouts. The citation chips let me verify precedents directly in the text without guessing.",
  },
  {
    name: "Emily Novak",
    major: "Mechanical Engineering",
    university: "Georgia Tech",
    avatar: "/avatars/emily.jpg",
    quote:
      "Practice quizzes generated from our Thermodynamics problem sets gave me instant explanations for why my formula choices were incorrect.",
  },
  {
    name: "Lucas Ferreira",
    major: "Cognitive Science",
    university: "UT Austin",
    avatar: "/avatars/lucas.jpg",
    quote:
      "I study on my laptop at the library and do flashcard flips on my phone while riding the bus. Everything stays in perfect sync.",
  },
  {
    name: "Hana Kim",
    major: "Electrical Engineering",
    university: "Purdue",
    avatar: "/avatars/hana.jpg",
    quote:
      "The slide citations are unbeatable. Other AI tools make up equations, but StudySync quotes the exact page from our signal processing slides.",
  },
  {
    name: "Tom Becker",
    major: "Economics & Data Analytics",
    university: "NYU Stern",
    avatar: "/avatars/tom.jpg",
    quote:
      "Turned a 120-page Econometrics syllabus into bite-sized practice tests. My retention has jumped dramatically this semester.",
  },
  {
    name: "Amara Nwosu",
    major: "Biology & Genetics",
    university: "Stanford",
    avatar: "/avatars/amara.jpg",
    quote:
      "The course isolation is essential. My Genetics materials never get mixed up with my Organic Chemistry notes. Clean and organized.",
  },
]

function Stars({ className }: { className?: string }) {
  return (
    <div role="img" aria-label="Rated 5 out of 5" className={cn("flex gap-0.5 text-primary", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-3.5 fill-current" />
      ))}
    </div>
  )
}

function ReviewCard({
  name,
  major,
  university,
  avatar,
  quote,
  duplicate,
}: Testimonial & { duplicate: boolean }) {
  return (
    <figure
      aria-hidden={duplicate || undefined}
      className="relative rounded-2xl border bg-card/80 p-6 shadow-[0_10px_40px_-24px_var(--glow)] before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-primary/50 before:to-transparent"
    >
      <Stars />
      <blockquote className="mt-4 text-[0.9375rem] leading-relaxed text-foreground/90">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="relative size-10 rounded-full ring-1 ring-primary/30 overflow-hidden bg-muted">
          <Image src={avatar} alt={name} fill sizes="40px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {major} · {university}
          </div>
        </div>
      </figcaption>
    </figure>
  )
}

function ReviewColumn({ items, className }: { items: Testimonial[]; className?: string }) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <div className="flex animate-marquee-up flex-col gap-6 pb-6 group-has-checked/reviews:[animation-play-state:paused] hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[false, true].flatMap((duplicate) =>
          items.map((item) => (
            <ReviewCard
              key={`${duplicate ? "dup-" : ""}${item.name}`}
              {...item}
              duplicate={duplicate}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function Testimonials() {
  return (
    <section id="reviews" className="relative mx-auto max-w-6xl scroll-mt-8 px-4 py-24 sm:px-6">
      {/* Background glow radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_65%,rgb(91_108_255/0.14),transparent)]"
      />

      <div className="reveal mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium text-primary">
          Reviews
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Don&apos;t take our word for it
        </h2>
        <p className="mt-4 text-muted-foreground">
          Students use StudySync to master complex lecture materials, retain concepts effortlessly, and ace their exams.
        </p>
      </div>

      <div className="group/reviews">
        <div className="relative flex max-h-[42rem] gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_15%,#000_85%,transparent)]">
          <ReviewColumn items={studentReviews.slice(0, 3)} className="[--duration:34s]" />
          <ReviewColumn
            items={studentReviews.slice(3, 6)}
            className="hidden md:block [--duration:44s]"
          />
          <ReviewColumn
            items={studentReviews.slice(6, 9)}
            className="hidden lg:block [--duration:39s]"
          />
        </div>

        {/* Pure CSS Accessible Pause Button using :has() */}
        <label
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-lg" }),
            "mx-auto mt-6 flex cursor-pointer rounded-full has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 motion-reduce:hidden"
          )}
        >
          <input type="checkbox" aria-label="Pause reviews" className="peer sr-only" />
          <Pause className="peer-checked:hidden" />
          <Play className="hidden peer-checked:block" />
        </label>
      </div>
    </section>
  )
}
