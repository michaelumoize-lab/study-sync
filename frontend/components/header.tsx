import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import Link from "next/link"
import { getServerSession } from "@/lib/get-session";

import { getQueryClient } from "@/lib/query-client"
import { UserButton } from "./auth/user/user-button"
import { Logo } from "./logo";

export async function Header() {
  const queryClient = getQueryClient()

  await getServerSession();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Logo />
            <span className="text-base font-semibold tracking-tight text-foreground">StudySync</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <Link href="/#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="/#tutor" className="transition-colors hover:text-foreground">
              AI Tutor
            </Link>
            <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="/#reviews" className="transition-colors hover:text-foreground">
              Reviews
            </Link>
            <Link href="/#quotas" className="transition-colors hover:text-foreground">
              Free Quotas
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <UserButton size="icon" />
          </div>
        </div>
      </header>
    </HydrationBoundary>
  )
}