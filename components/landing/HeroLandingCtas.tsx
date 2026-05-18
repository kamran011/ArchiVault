"use client"

import Link from "next/link"
import { telemetry } from "@/lib/telemetry"
import { useGuestBlueprintStatus } from "@/hooks/use-guest-blueprint-status"
import { GuestAwareCtas } from "./GuestAwareCtas"

export function HeroLandingCtas() {
  const { isLoaded, isSignedIn, hasUsedGuest, ready } = useGuestBlueprintStatus()

  if (!isLoaded) {
    return (
      <div className="mb-6 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <div className="h-14 w-full max-w-xs animate-pulse rounded-xl bg-muted/40 sm:w-48" aria-hidden />
        <div className="h-11 w-full max-w-xs animate-pulse rounded-xl bg-muted/30 sm:w-36" aria-hidden />
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="mb-6 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Link
          href="/dashboard"
          className="landing-cta landing-cta-primary landing-cta-hero w-full rounded-xl bg-cyan-500 px-10 py-5 text-lg font-bold text-black shadow-xl shadow-cyan-500/35 hover:bg-cyan-400 sm:w-auto"
        >
          Open dashboard
        </Link>
        <LearnMoreButton />
      </div>
    )
  }

  if (ready && hasUsedGuest) {
    return (
      <div className="mb-6 space-y-3">
        <GuestAwareCtas layout="hero" />
        <div className="flex justify-center">
          <LearnMoreButton />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
      <Link
        href="/sign-up"
        onClick={() => telemetry("cta_hero_signup")}
        className="landing-cta landing-cta-primary landing-cta-hero w-full rounded-xl bg-cyan-500 px-10 py-5 text-lg font-bold text-black shadow-xl shadow-cyan-500/35 hover:bg-cyan-400 sm:w-auto"
      >
        Generate free blueprint
      </Link>
      <GuestAwareCtas layout="hero" />
      <LearnMoreButton />
    </div>
  )
}

function LearnMoreButton() {
  return (
    <button
      type="button"
      onClick={() => {
        telemetry("cta_hero_learn_more")
        document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
      }}
      className="landing-cta w-full rounded-xl border border-border px-6 py-3 text-sm text-muted-foreground transition-colors hover:border-zinc-500 hover:text-foreground sm:w-auto"
    >
      Learn more
    </button>
  )
}
