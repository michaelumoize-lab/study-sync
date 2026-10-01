import Image from "next/image"
import logoImg from "@/public/study-sync-logo.png"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  priority?: boolean
}

export function Logo({ className = "size-7", size = 28, priority }: LogoProps) {
  return (
    <div className={cn("relative shrink-0 inline-flex items-center justify-center", className)}>
      <Image
        src={logoImg}
        alt="StudySync Logo"
        width={size}
        height={size}
        priority={priority}
        className="size-full object-contain drop-shadow-[0_0_12px_var(--glow)]"
      />
    </div>
  )
}