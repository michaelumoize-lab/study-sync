import { LandingHero } from "@/components/landing/landing-hero"
import { InteractivePreview } from "@/components/landing/interactive-preview"
import { FeaturesBento } from "@/components/landing/features-bento"
import { TutorSpotlight } from "@/components/landing/tutor-spotlight"
import { HowItWorks } from "@/components/landing/how-it-works"
import { SurfacesShowcase } from "@/components/landing/surfaces-showcase"
import { Testimonials } from "@/components/landing/testimonials"
import { FreeTierCard } from "@/components/landing/free-tier-card"
import { CtaSection } from "@/components/landing/cta-section"
import { SiteFooter } from "@/components/landing/site-footer"

export default function Home() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip bg-background">
      <main className="flex-1">
        {/* 1. Atmospheric Hero with hero-globe ambient scene */}
        <LandingHero />

        {/* 2. Cockpit Workspace Preview (Grounded Slide + Citation Chat) */}
        <InteractivePreview />

        {/* 3. Core Study Capabilities Bento Grid */}
        <FeaturesBento />

        {/* 4. AI Course Tutor Spotlight with tutor-bulb ambient scene */}
        <TutorSpotlight />

        {/* 5. 3-Step Student Workflow with path-scene ambient scene */}
        <HowItWorks />

        {/* 6. Desktop vs. Mobile Dedicated Surfaces Comparison */}
        <SurfacesShowcase />

        {/* 7. Student Reviews & Testimonials Marquee */}
        <Testimonials />

        {/* 8. 100% Free MVP Tier & Quotas Breakdown */}
        <FreeTierCard />

        {/* 9. Closing CTA with cta-globe ambient scene */}
        <CtaSection />
      </main>

      {/* 10. Site Footer with footer-scene ambient scene */}
      <SiteFooter />
    </div>
  )
}
