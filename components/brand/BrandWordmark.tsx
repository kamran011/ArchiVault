import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArchivoltLogo } from "./ArchivoltLogo"

export function BrandWordmark({
  href = "/",
  className,
  logoSize = 24,
  textClassName,
  asLink = true,
}: {
  href?: string
  className?: string
  logoSize?: number
  textClassName?: string
  asLink?: boolean
}) {
  const inner = (
    <>
      <ArchivoltLogo size={logoSize} />
      <span className={cn("font-semibold tracking-tight text-foreground", textClassName)}>Archivolt</span>
    </>
  )

  if (!asLink) {
    return <div className={cn("flex items-center gap-2", className)}>{inner}</div>
  }

  return (
    <Link href={href} className={cn("flex items-center gap-2 transition-opacity hover:opacity-80", className)}>
      {inner}
    </Link>
  )
}
