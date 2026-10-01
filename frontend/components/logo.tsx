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
    <div
      style={{ width: size, height: size }}
      className={cn("relative shrink-0 overflow-hidden inline-flex items-center justify-center", className)}
    >
      <Image
        src={logoImg}
        alt="StudySync Logo"
        width={size}
        height={size}
        priority={priority}
        style={{ width: `${size}px`, height: `${size}px`, maxWidth: `${size}px`, maxHeight: `${size}px` }}
        className="object-contain"
      />
    </div>
  )
}