"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { telemetry } from "@/lib/telemetry"
import { useGuestBlueprintStatus } from "@/hooks/use-guest-blueprint-status"

type GuestAwareCtasProps = {
  layout?: "hero" | "inline"
  className?: string
}

export function GuestAwareCtas({ layout = "hero", className }: GuestAwareCtasProps) {
  const { isSignedIn, hasUsedGuest, ready } = useGuestBlueprintStatus()

  if (isSignedIn) {
    return null
  }

  const isHero = layout === "hero"
  const primaryClass = isHero
    ? "landing-cta landing-cta-primary landing-cta-hero w-full rounded-xl bg-cyan-500 px-10 py-5 text-lg font-bold text-black shadow-xl shadow-cyan-500/35 hover:bg-cyan-400 sm:w-auto"
    : "landing-cta landing-cta-primary inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-black hover:bg-cyan-400"

  const secondaryClass = isHero
    ? "landing-cta landing-cta-secondary w-full rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground/90 hover:border-zinc-500 hover:text-foreground sm:w-auto"
    : "landing-cta landing-cta-secondary inline-flex rounded-xl border border-border px-6 py-3.5 text-base text-foreground/80 hover:border-zinc-500"

  const tertiaryClass = isHero
    ? "landing-cta w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/15 sm:w-auto"
    : "inline-flex rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3.5 text-base font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/15"

  if (!ready) {
    return (
      <div
        className={cn(
          isHero
            ? "h-[52px] w-full max-w-xs animate-pulse rounded-xl bg-muted/40 sm:w-40"
            : "h-12 w-36 animate-pulse rounded-xl bg-muted/40",
          className,
        )}
        aria-hidden
      />
    )
  }

  if (hasUsedGuest) {
    return (
      <div
        className={cn(
          isHero
            ? "flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
            : "flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap",
          className,
        )}
      >
        <Link
          href="/sign-up"
          onClick={() => telemetry("cta_returning_generate_another")}
          className={primaryClass}
        >
          Generate another
        </Link>
        <Link
          href="/pricing"
          onClick={() => telemetry("cta_returning_try_pro")}
          className={secondaryClass}
        >
          Try Pro
        </Link>
        <Link
          href="/sign-up?from=guest"
          onClick={() => telemetry("cta_returning_save_blueprint")}
          className={tertiaryClass}
        >
          Save this
        </Link>
      </div>
    )
  }

  return (
    <Link
      href="/try"
      onClick={() => telemetry(isHero ? "cta_hero_guest" : "cta_example_guest")}
      className={cn(
        isHero
          ? "landing-cta landing-cta-secondary w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/15 sm:w-auto"
          : "landing-cta landing-cta-secondary inline-flex rounded-xl border border-border px-6 py-3.5 text-base text-foreground/80 hover:border-zinc-500",
        className,
      )}
    >
      Try as guest
    </Link>
  )
}
