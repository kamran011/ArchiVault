"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { FITCOACH_DEMO } from "@/lib/demo/fitcoach-example"
import { telemetry } from "@/lib/telemetry"
import { cn } from "@/lib/utils"
import { useGuestBlueprintStatus } from "@/hooks/use-guest-blueprint-status"

const MermaidDiagram = dynamic(
  () => import("@/components/dashboard/MermaidDiagram").then((m) => m.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Loading preview…
      </div>
    ),
  },
)

export function HeroDemoPreview({ className }: { className?: string }) {
  const demo = FITCOACH_DEMO
  const { isSignedIn, hasUsedGuest, ready } = useGuestBlueprintStatus()

  const href = isSignedIn ? "/dashboard" : ready && hasUsedGuest ? "/sign-up?from=guest" : "/try"
  const ariaLabel =
    ready && hasUsedGuest && !isSignedIn
      ? "Save your guest blueprint — sign up"
      : "Try the FitCoach example blueprint — opens guest try page"
  const subtext =
    ready && hasUsedGuest && !isSignedIn
      ? "You already tried guest — sign up to save and generate more"
      : "Click to generate your own — no sign-up"
  const footerCta =
    ready && hasUsedGuest && !isSignedIn ? "Save this blueprint →" : "Try it free →"

  return (
    <div className={cn("mx-auto w-full max-w-4xl", className)}>
      <p className="mb-3 text-center text-sm font-medium text-foreground sm:text-base">
        See what you&apos;ll get in 60 seconds
      </p>
      <Link
        href={href}
        onClick={() =>
          telemetry(
            ready && hasUsedGuest && !isSignedIn ? "cta_hero_demo_save" : "cta_hero_demo_click",
          )
        }
        className="group block rounded-2xl border border-cyan-500/25 bg-card/90 p-4 shadow-xl shadow-cyan-500/10 transition-all hover:border-cyan-400/50 hover:shadow-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 sm:p-5"
        aria-label={ariaLabel}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-400/90">{demo.systemName}</p>
            <p className="text-[11px] text-muted-foreground">{subtext}</p>
          </div>
          <div className="flex items-baseline gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5">
            <span className="text-2xl font-bold tabular-nums text-cyan-400">{demo.futureProofScore}</span>
            <span className="text-[10px] uppercase text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-background/60 p-2 sm:p-3">
          <p className="mb-2 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            Architecture map (Mermaid)
          </p>
          <div className="max-h-44 overflow-auto sm:max-h-52">
            <MermaidDiagram diagram={demo.mermaidDiagram} systemName={demo.systemName} />
          </div>
        </div>

        <p className="mt-3 text-center text-xs font-medium text-cyan-300/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {footerCta}
        </p>
      </Link>
    </div>
  )
}
