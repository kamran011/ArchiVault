"use client"

import { useState } from "react"
import type { Architecture, PatternRecommendation, SystemDesign } from "@/types/architecture"
import type { UserPlan } from "@/lib/plan-gate"
import { canAccessSystemDesign } from "@/lib/plan-gate"
import {
  accentHighlightClass,
  accentIconClass,
  destructiveIconClass,
  destructiveTextClass,
  sdCategoryBadgeClass,
  sdComplexityTextClass,
  sdMandatoryCardBorderClass,
  sdPriorityBadgeClass,
  sdPriorityIconClass,
  sdRiskCalloutBodyClass,
  sdRiskCalloutClass,
  sdRiskCalloutTitleClass,
} from "@/lib/theme-badges"
import { cn } from "@/lib/utils"
import { PricingCtaLink } from "@/components/shared/PricingCtaLink"
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Lock,
} from "lucide-react"

const PRIORITY_CONFIG = {
  mandatory: { icon: AlertTriangle, label: "MANDATORY" },
  recommended: { icon: CheckCircle, label: "RECOMMENDED" },
  optional: { icon: Info, label: "OPTIONAL" },
} as const

const COMPLEXITY_CONFIG = {
  low: { label: "Low complexity" },
  medium: { label: "Medium complexity" },
  high: { label: "High complexity" },
} as const

function groupByComponent(patterns: PatternRecommendation[]) {
  return patterns.reduce(
    (acc, pattern) => {
      const key = pattern.appliesTo
      if (!acc[key]) acc[key] = []
      acc[key].push(pattern)
      return acc
    },
    {} as Record<string, PatternRecommendation[]>,
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 h-4 w-48 rounded bg-muted" />
          <div className="mb-2 h-3 w-full rounded bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

interface SystemDesignTabProps {
  architecture: Architecture
  generationId: string | null
  userPlan: UserPlan
  onSystemDesignUpdate?: (systemDesign: SystemDesign) => void
}

export function SystemDesignTab({
  architecture,
  generationId,
  userPlan,
  onSystemDesignUpdate,
}: SystemDesignTabProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [systemDesign, setSystemDesign] = useState<SystemDesign | null>(
    architecture.systemDesign ?? null,
  )
  const [activeCategory, setActiveCategory] = useState<string>("all")

  if (!canAccessSystemDesign(userPlan)) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">System Design is a Team feature</h3>
        <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
          Get pattern-by-pattern recommendations for your architecture — circuit breakers, message
          queues, caching strategies, and more. Based on 50 proven system design patterns.
        </p>

        <div className="relative w-full max-w-2xl overflow-hidden rounded-xl">
          <div className="pointer-events-none select-none opacity-60 blur-sm">
            <div className="mb-3 rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("font-mono text-sm font-bold", accentHighlightClass)}>IPaymentProcessor</span>
                <span className={cn("rounded-full border px-2 py-0.5 text-xs", sdPriorityBadgeClass.mandatory)}>
                  MANDATORY
                </span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg bg-muted p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Circuit Breaker</p>
                  <p className="text-xs text-muted-foreground">
                    Stripe outages are inevitable. Without a circuit breaker...
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Idempotency</p>
                  <p className="text-xs text-muted-foreground">
                    Payment retries must never double-charge customers...
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background via-background/80 to-transparent pb-6">
            <PricingCtaLink
              href="/#pricing"
              className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
            >
              Upgrade to Team — $79/mo
            </PricingCtaLink>
          </div>
        </div>
      </div>
    )
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/generate-system-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ architecture, generationId }),
      })

      const data = (await res.json()) as { systemDesign?: SystemDesign; error?: string }
      if (!res.ok) throw new Error(data.error || "Failed to generate system design")

      if (!data.systemDesign) throw new Error("No system design returned")
      setSystemDesign(data.systemDesign)
      onSystemDesignUpdate?.(data.systemDesign)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className={cn("mb-3 h-6 w-6 animate-spin", accentIconClass)} />
          <p className="text-sm text-muted-foreground">Analyzing patterns… usually 30–90 seconds</p>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (!systemDesign) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
          <Zap className={cn("h-6 w-6", accentIconClass)} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">Generate System Design</h3>
        <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
          Analyze your VBD architecture against 50 system design patterns. Get mandatory
          recommendations, risk assessments, and implementation guidance for every component.
        </p>
        {error ? <p className={cn("mb-4 text-sm", destructiveTextClass)}>{error}</p> : null}
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          Analyze System Design
        </button>
      </div>
    )
  }

  const categories = [
    "all",
    ...new Set(systemDesign.patterns.map((p) => p.patternCategory)),
  ]

  const filteredPatterns =
    activeCategory === "all"
      ? systemDesign.patterns
      : systemDesign.patterns.filter((p) => p.patternCategory === activeCategory)

  const filteredGrouped = groupByComponent(filteredPatterns)

  const mandatoryCount = systemDesign.patterns.filter((p) => p.priority === "mandatory").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Infrastructure</p>
          <p className="text-sm leading-relaxed text-foreground/80">{systemDesign.infrastructureSummary}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Scaling Strategy</p>
          <p className="text-sm leading-relaxed text-foreground/80">{systemDesign.scalingStrategy}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Critical Failure Points</p>
          <ul className="space-y-1.5">
            {systemDesign.criticalFailurePoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", destructiveIconClass)} />
                <span className="text-foreground/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Data Flow</p>
        <p className="text-sm leading-relaxed text-foreground/80">{systemDesign.dataFlowDescription}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">Est. infrastructure cost:</span>
          <span className={cn("font-mono text-xs", accentHighlightClass)}>
            {systemDesign.estimatedInfrastructureCost}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span className="text-xs text-muted-foreground">{mandatoryCount} mandatory patterns</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="text-xs text-muted-foreground">
            {systemDesign.patterns.filter((p) => p.priority === "recommended").length} recommended
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-zinc-500" />
          <span className="text-xs text-muted-foreground">
            {systemDesign.patterns.filter((p) => p.priority === "optional").length} optional
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${
              activeCategory === cat
                ? "border-cyan-500 bg-cyan-500 font-semibold text-black"
                : "border-border bg-card text-muted-foreground hover:border-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(filteredGrouped).map(([component, patterns]) => (
          <div key={component}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className={cn("font-mono text-sm font-bold", accentHighlightClass)}>{component}</h3>
              <div className="h-px flex-1 bg-muted" />
              <span className="text-xs text-muted-foreground/70">
                {patterns.length} pattern{patterns.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {patterns
                .sort((a, b) => {
                  const order = { mandatory: 0, recommended: 1, optional: 2 }
                  return order[a.priority] - order[b.priority]
                })
                .map((pattern, i) => {
                  const priorityConfig = PRIORITY_CONFIG[pattern.priority]
                  const PriorityIcon = priorityConfig.icon
                  const categoryColor =
                    sdCategoryBadgeClass[pattern.patternCategory] ?? sdCategoryBadgeClass.infrastructure
                  const complexityConfig = COMPLEXITY_CONFIG[pattern.complexity]

                  return (
                    <div
                      key={i}
                      className={cn(
                        "rounded-xl border bg-card p-5",
                        pattern.priority === "mandatory" ? sdMandatoryCardBorderClass : "border-border",
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{pattern.patternName}</h4>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs capitalize",
                              categoryColor,
                            )}
                          >
                            {pattern.patternCategory}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <PriorityIcon className={cn("h-3.5 w-3.5", sdPriorityIconClass[pattern.priority])} />
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs font-bold",
                              sdPriorityBadgeClass[pattern.priority],
                            )}
                          >
                            {priorityConfig.label}
                          </span>
                        </div>
                      </div>
                      <p className="mb-3 text-sm leading-relaxed text-foreground/80">{pattern.reason}</p>
                      {pattern.priority === "mandatory" ? (
                        <div className={sdRiskCalloutClass}>
                          <p className={sdRiskCalloutTitleClass}>Risk if ignored</p>
                          <p className={sdRiskCalloutBodyClass}>{pattern.riskIfIgnored}</p>
                        </div>
                      ) : null}
                      <span className={cn("text-xs", sdComplexityTextClass[pattern.complexity])}>
                        {complexityConfig.label}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground/80"
        >
          <Zap className="h-3.5 w-3.5" />
          Regenerate analysis
        </button>
      </div>
    </div>
  )
}
