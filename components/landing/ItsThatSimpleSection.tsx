"use client"

import { FileText, MousePointerClick, Package } from "lucide-react"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

const STEPS = [
  {
    icon: FileText,
    title: "Describe your system",
    body: "Paste a plain-English overview. No diagrams needed.",
  },
  {
    icon: MousePointerClick,
    title: "Click Generate",
    body: "Claude analyzes volatility axes in 60 seconds.",
  },
  {
    icon: Package,
    title: "Get Your Blueprint",
    body: "Mermaid diagram, build order, future-proof score, scaffold prompt for AI coding agents.",
  },
] as const

export function ItsThatSimpleSection() {
  return (
    <section className="border-t border-border/50 bg-zinc-950/40 px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-500/90">
            Plain English in → structured blueprint out
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            It&apos;s That Simple
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Three inputs. One blueprint.</p>
        </ScrollReveal>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <ScrollReveal key={step.title} delay={index * 60} className="text-center sm:text-left">
                <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 text-cyan-400 sm:mx-0">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Step {index + 1}
                </p>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal delay={120} className="mt-14 text-center">
          <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground/85">
            No architecture background required. No complex tooling.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-base text-muted-foreground">
            Just clear thinking about what changes.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
