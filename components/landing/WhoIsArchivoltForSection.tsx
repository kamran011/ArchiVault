"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { StaggerGroup, StaggerItem } from "@/components/shared/StaggerReveal"

const FOR_YOU = [
  "You're designing a new system from scratch",
  "You want to separate volatile adapters from stable core",
  "You need a structured blueprint before coding",
  "You're refactoring legacy code into modular layers",
  "You want to justify architecture decisions to stakeholders",
] as const

const NOT_FOR_YOU = [
  "You need live code generation (we generate blueprints, not code)",
  "You want to modify existing monoliths without refactoring",
  "You prefer freestyle architecture without methodology",
  "You need real-time collaboration on the same diagram",
  "You want enterprise support contracts",
] as const

function FitList({
  items,
  variant,
}: {
  items: readonly string[]
  variant: "for" | "not"
}) {
  const isFor = variant === "for"

  return (
    <StaggerGroup className="space-y-4">
      {items.map((item, index) => (
        <StaggerItem
          key={item}
          index={index}
          className="flex items-start justify-between gap-4 text-sm leading-relaxed"
        >
          <span className="text-foreground/90">{item}</span>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 font-medium",
              isFor ? "text-emerald-400" : "text-red-400",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded",
                isFor ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/15 text-red-400",
              )}
              aria-hidden
            >
              {isFor ? <Check className="size-3.5 stroke-[2.5]" /> : <X className="size-3.5 stroke-[2.5]" />}
            </span>
            {isFor ? "Yes" : "No"}
          </span>
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
}

export function WhoIsArchivoltForSection() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-500">Audience</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">For whom?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Archivolt is for senior architects, staff engineers, and tech leads who design systems that need to survive
            change.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <ScrollReveal delay={80} className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10 sm:p-8">
            <h3 className="mb-6 text-lg font-semibold text-cyan-400">Archivolt is for you if</h3>
            <FitList items={FOR_YOU} variant="for" />
          </ScrollReveal>

          <ScrollReveal delay={160} className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10 sm:p-8">
            <h3 className="mb-6 text-lg font-semibold text-red-400">Archivolt is NOT for you if</h3>
            <FitList items={NOT_FOR_YOU} variant="not" />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
