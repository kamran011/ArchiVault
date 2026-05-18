"use client"

import dynamic from "next/dynamic"
import { FITCOACH_DEMO } from "@/lib/demo/fitcoach-example"
import { cn } from "@/lib/utils"

const MermaidDiagram = dynamic(
  () => import("@/components/dashboard/MermaidDiagram").then((m) => m.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Loading diagram…
      </div>
    ),
  },
)

export function HeroDemoPreview({ className }: { className?: string }) {
  const demo = FITCOACH_DEMO

  return (
    <div
      className={cn(
        "mx-auto max-w-5xl rounded-2xl border border-cyan-500/20 bg-card/80 p-4 shadow-xl shadow-cyan-500/5 backdrop-blur sm:p-6",
        className,
      )}
    >
      <p className="mb-1 text-center text-xs font-medium uppercase tracking-widest text-cyan-400/90">
        {demo.systemName}
      </p>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Generated in {demo.generationSeconds} seconds. Here&apos;s what you&apos;ll get.
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background/60 p-4 lg:col-span-1">
          <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Future-proof score</p>
          <p className="text-4xl font-bold text-cyan-400">{demo.futureProofScore}</p>
          <p className="text-xs text-muted-foreground">out of 100</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-background/60 p-3 lg:col-span-2">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Architecture map</p>
          <div className="max-h-52 overflow-auto">
            <MermaidDiagram diagram={demo.mermaidDiagram} systemName={demo.systemName} />
          </div>
        </div>
      </div>

      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Key volatility axes</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {demo.volatilityAxes.map((axis) => (
          <div
            key={axis.name}
            className="rounded-lg border border-border bg-background/50 px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">{axis.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{axis.ship}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{axis.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
