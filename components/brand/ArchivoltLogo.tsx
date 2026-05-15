import { cn } from "@/lib/utils"

/**
 * Brand mark: stable core (center) + layered volatile axes — fits VBD, not generic “AI lightning”.
 */
export function ArchivoltLogo({
  className,
  size = 24,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect x="4" y="4" width="24" height="24" rx="6" className="fill-cyan-500/15 stroke-cyan-500/40" strokeWidth="1" />
      <rect x="12" y="12" width="8" height="8" rx="2" className="fill-cyan-500" />
      <path
        d="M16 4v4M16 24v4M4 16h4M24 16h4"
        className="stroke-cyan-400/70"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8"
        className="stroke-cyan-300/50"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
