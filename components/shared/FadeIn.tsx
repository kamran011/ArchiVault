import { cn } from "@/lib/utils"

export function FadeIn({
  className,
  children,
  delayMs,
}: {
  className?: string
  children: React.ReactNode
  delayMs?: number
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none motion-reduce:opacity-100",
        className,
      )}
      style={delayMs !== undefined ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  )
}
