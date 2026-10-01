import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const quotaFeatures = [
  "5 Active course workspaces (e.g. CS, Bio, Math, History, Econ)",
  "Up to 10 lecture documents per course (up to 50MB per PDF)",
  "Unlimited course-grounded AI chat with exact slide citations",
  "5 AI flashcard deck generations per day (5, 10, or 20 cards)",
  "5 Practice quiz generations per day with instant explanations",
  "Cross-device sync across desktop browser and mobile devices",
  "Zero credit card or payment info required",
]

export function FreeTierCard() {
  return (
    <section id="quotas" className="mx-auto max-w-4xl scroll-mt-8 px-4 py-24 sm:px-6">
      <div className="reveal mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium text-primary">
          Pricing
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          100% Free for students
        </h2>
        <p className="mt-4 text-muted-foreground">
          Generous quotas designed to easily power your entire semester course load. No credit card, no surprises.
        </p>
      </div>

      <div className="reveal">
        <Card className="[--card-spacing:--spacing(6)] ring-primary/50 shadow-[0_0_60px_-15px_var(--glow)] border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Student Free Tier</CardTitle>
              <CardDescription>Everything you need for your classes this semester.</CardDescription>
            </div>
            <Badge>100% Free</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="flex items-baseline gap-1">
              <span className="font-heading text-4xl font-semibold tracking-tight text-foreground">$0</span>
              <span className="text-muted-foreground">/ semester</span>
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {quotaFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-foreground/90">
                  <Check className="size-4 text-primary shrink-0" />
                  <span className="text-xs sm:text-sm">{feat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-2">
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ size: "xl" }), "w-full justify-center")}
            >
              Start Studying Free <ArrowRight className="size-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
