"use client"

import { useState } from "react"
import type { Architecture, TechStackAnalysis } from "@/types/architecture"
import {
  accentBadgeClass,
  accentEmphasisClass,
  accentIconClass,
  subtleOutlineBadgeClass,
} from "@/lib/theme-badges"
import { CopyButton } from "@/components/shared/CopyButton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Database,
  Shield,
  Server,
  Cloud,
  Layers,
  Package,
  Code2,
  HardDrive,
  Radio,
  Box,
  Loader2,
  Zap,
} from "lucide-react"

const LAYER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  db: Database,
  auth: Shield,
  authentication: Shield,
  api: Server,
  backend: Server,
  deploy: Cloud,
  deployment: Cloud,
  queue: Radio,
  cache: HardDrive,
  storage: HardDrive,
  frontend: Code2,
  monitoring: Layers,
  default: Box,
}

function layerIcon(layer: string) {
  const key = layer.toLowerCase()
  for (const [match, Icon] of Object.entries(LAYER_ICONS)) {
    if (key.includes(match)) return Icon
  }
  return LAYER_ICONS.default
}

function formatTag(value: string) {
  if (!value || value === "Any") return null
  return value
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

interface TechStackTabProps {
  architecture: Architecture
  generationId: string | null
  techStack?: string
  onTechStackUpdate?: (techStackAnalysis: TechStackAnalysis) => void
  onGeneratingChange?: (generating: boolean) => void
}

export function TechStackTab({
  architecture,
  generationId,
  techStack = "Any",
  onTechStackUpdate,
  onGeneratingChange,
}: TechStackTabProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<TechStackAnalysis | null>(
    architecture.techStackAnalysis ?? null,
  )

  async function handleGenerate() {
    setLoading(true)
    onGeneratingChange?.(true)
    setError(null)
    try {
      const res = await fetch("/api/generate-tech-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ architecture, generationId, techStack }),
      })
      const data = (await res.json()) as { techStackAnalysis?: TechStackAnalysis; error?: string }
      if (!res.ok) throw new Error(data.error || "Failed to generate tech stack")
      if (!data.techStackAnalysis) throw new Error("No tech stack analysis returned")
      setAnalysis(data.techStackAnalysis)
      onTechStackUpdate?.(data.techStackAnalysis)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
      onGeneratingChange?.(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="mb-3 h-6 w-6 animate-spin text-cyan-400" />
          <p className="text-sm text-muted-foreground">Analyzing tech stack… usually 45–90 seconds</p>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
          <Package className="h-6 w-6 text-cyan-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">Generate Tech Stack</h3>
        <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
          Get layer-by-layer recommendations, per-axis library picks, install commands, and adapter
          boilerplate tailored to your VBD architecture.
        </p>
        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          Generate Tech Stack
        </button>
      </div>
    )
  }

  const tags = [
    formatTag(analysis.selectedStack),
    formatTag(analysis.selectedScale),
    formatTag(analysis.selectedIndustry),
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn("text-xs", accentBadgeClass)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Stack overview
        </h3>
        <p className="text-sm leading-relaxed text-foreground/80">{analysis.stackSummary}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Recommended stack
        </h3>
        <div className="space-y-4">
          {analysis.layers.map((layer) => {
            const Icon = layerIcon(layer.layer)
            return (
              <div
                key={layer.layer}
                className="rounded-lg border border-border bg-muted/50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-4", accentIconClass)} aria-hidden />
                    <span className="text-sm font-medium text-foreground">{layer.layer}</span>
                    <span className={cn("text-sm", accentEmphasisClass)}>{layer.recommended}</span>
                  </div>
                  <CopyButton text={layer.installCommand} label="Copy install" />
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{layer.why}</p>
                {layer.alternatives.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {layer.alternatives.map((alt) => (
                      <Badge
                        key={alt}
                        variant="outline"
                        className={cn("text-[10px]", subtleOutlineBadgeClass)}
                      >
                        {alt}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Per volatile axis
        </h3>
        <div className="space-y-4">
          {analysis.axisRecommendations.map((axis) => (
            <div
              key={axis.interfaceName}
              className="rounded-lg border border-border bg-muted/50 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={cn("font-mono text-sm", accentEmphasisClass)}>{axis.interfaceName}</span>
                  <span className="ml-2 text-sm text-muted-foreground">→ {axis.recommendedLibrary}</span>
                </div>
                <CopyButton text={axis.installCommand} label="Copy install" />
              </div>
              <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground/80">
                {axis.adapterBoilerplate}
              </pre>
              {axis.alternatives.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {axis.alternatives.map((alt) => (
                    <Badge
                      key={alt}
                      variant="outline"
                      className={cn("text-[10px]", subtleOutlineBadgeClass)}
                    >
                      {alt}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Dependencies
        </h3>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Production
              </span>
              <CopyButton text={analysis.packageJson} label="Copy" />
            </div>
            <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground/80">
              {analysis.packageJson}
            </pre>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dev dependencies
              </span>
              <CopyButton text={analysis.devDependencies} label="Copy" />
            </div>
            <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground/80">
              {analysis.devDependencies}
            </pre>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground/80"
        >
          <Zap className="h-3.5 w-3.5" />
          Regenerate tech stack
        </button>
      </div>
    </div>
  )
}
