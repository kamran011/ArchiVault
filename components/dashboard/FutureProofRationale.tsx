"use client"

import { cn } from "@/lib/utils"
import type { FutureProofRationale as FutureProofRationaleType } from "@/lib/future-proof-rationale"
import { accentMonoBadgeClass } from "@/lib/theme-badges"

export function FutureProofRationale({
  rationale,
  fallbackText,
}: {
  rationale: FutureProofRationaleType | null
  fallbackText?: string
}) {
  if (!rationale) {
    if (!fallbackText) return null
    return <p className="text-sm leading-relaxed text-foreground/80">{fallbackText}</p>
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="leading-relaxed text-foreground/90">{rationale.headline}</p>

      {rationale.axesCovered.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Axes covered
          </p>
          <div className="flex flex-wrap gap-1.5">
            {rationale.axesCovered.map((axis) => (
              <span key={axis} className={cn("rounded-md border px-2 py-0.5 font-mono text-[11px]", accentMonoBadgeClass)}>
                {axis}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {rationale.deductions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deductions</p>
          {rationale.deductions.map((d, i) => (
            <div
              key={i}
              className="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 dark:border-amber-800/50 dark:bg-amber-950/30"
            >
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">−{d.points} pts</p>
              <p className="mt-0.5 text-foreground/80">{d.reason}</p>
            </div>
          ))}
        </div>
      ) : null}

      {rationale.scenarios.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Future scenarios
          </p>
          <div className="grid gap-2">
            {rationale.scenarios.map((scenario, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/40 p-3"
              >
                <p className="font-medium text-foreground">{scenario.title}</p>
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium text-foreground/80">Trigger: </span>
                  {scenario.trigger}
                </p>
                <p className="mt-1.5 text-foreground/80">
                  <span className="font-medium text-foreground">Changes: </span>
                  {scenario.whatChanges}
                </p>
                <p className="mt-1 text-foreground/80">
                  <span className="font-medium text-foreground">Stays stable: </span>
                  {scenario.whatStaysStable}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
