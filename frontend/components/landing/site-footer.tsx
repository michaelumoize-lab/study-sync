import Link from "next/link"
import { Logo } from "@/components/logo"
import { HeroVideo } from "./hero-video"

const columns = [
  {
    title: "Study",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#tutor", label: "AI Tutor" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/#reviews", label: "Reviews" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign In" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/#quotas", label: "Free Quotas" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
]

export function SiteFooter() {
  return (
    // From md up the height tracks the width, so the scene's character keeps the same spot beside the text.
    <footer className="relative isolate flex flex-col border-t md:h-[clamp(36rem,50vw,60rem)]">
      {/* The character sits bottom-left of the video. On phones the video is a strip under the links so it never sits behind text. */}
      <HeroVideo name="footer-scene" className="object-bottom-left mask-t-from-75% max-md:top-auto max-md:h-104" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/4 bg-linear-to-t from-background to-transparent" />

      <div className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-12 px-4 pt-16 pb-72 sm:px-6 md:grid-cols-[1fr_auto] md:pt-20 md:pb-0">
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
            <Logo className="size-7" />
            <span className="text-lg">StudySync</span>
          </Link>
          <p className="mt-4 max-w-xs text-base text-muted-foreground">
            Course-grounded AI study platform for students who want to master exams.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-10 sm:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title}>
              <h3 className="font-heading text-sm font-medium text-foreground">{c.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <p className="border-t py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudySync. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
