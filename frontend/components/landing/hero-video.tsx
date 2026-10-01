import { cn } from "@/lib/utils"

interface HeroVideoProps {
  name: string
  className?: string
}

/**
 * A muted, looping video scene (public/<name>.mp4, poster public/<name>.jpg) behind sections.
 * Automatically falls back to the static poster image under `prefers-reduced-motion`.
 */
export function HeroVideo({ name, className }: HeroVideoProps) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster={`/${name}.jpg`}
      aria-hidden
      className={cn(
        "absolute inset-0 -z-10 size-full object-cover motion-safe:animate-in fade-in duration-1000",
        className
      )}
    >
      <source
        src={`/${name}.mp4`}
        type="video/mp4"
        media="(prefers-reduced-motion: no-preference)"
      />
    </video>
  )
}
