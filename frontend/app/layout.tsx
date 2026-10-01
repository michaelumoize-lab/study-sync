import type { Metadata } from "next"
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import type { ReactNode } from "react"

import { ThemeProvider } from "next-themes"
import { Header } from "@/components/header"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "StudySync — Grounded AI Study Platform",
    template: "%s | StudySync",
  },
  description:
    "Course-grounded AI study platform for students to organize lecture slides, handouts, and notes, and actively study through grounded AI tutors and cited flashcards.",
  applicationName: "StudySync",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark font-sans antialiased",
        plusJakartaSans.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-svh flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <Header />

            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}