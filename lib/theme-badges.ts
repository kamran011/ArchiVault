import { cn } from "@/lib/utils"

/** Cyan accent pill — readable in light and dark mode */
export const accentBadgeClass =
  "border-cyan-600/30 bg-cyan-500/15 text-cyan-900 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300"

export const accentMonoBadgeClass = cn(accentBadgeClass, "font-mono text-[11px]")

export const subtleOutlineBadgeClass =
  "border-border bg-muted/80 text-foreground/80 dark:bg-transparent dark:text-muted-foreground"

export const upgradeButtonClass =
  "shrink-0 rounded-md border border-cyan-600/35 bg-cyan-500/15 px-2.5 py-1 text-xs font-medium text-cyan-800 transition-colors hover:border-cyan-600/50 hover:bg-cyan-500/25 hover:text-cyan-900 disabled:opacity-50 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:border-cyan-400/60 dark:hover:bg-cyan-500/15 dark:hover:text-cyan-300"

export const blueprintTabBadgeClass =
  "border-emerald-600/30 bg-emerald-500/15 px-1.5 py-0 text-[9px] font-semibold uppercase text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"

export const proTabBadgeClass =
  "border-cyan-600/30 bg-cyan-500/15 px-1.5 py-0 text-[9px] font-semibold uppercase text-cyan-900 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300"

export const teamTabBadgeClass =
  "border-purple-600/30 bg-purple-500/15 px-1.5 py-0 text-[9px] font-semibold uppercase text-purple-900 dark:border-purple-500/30 dark:bg-purple-900 dark:text-purple-300"

export const accentIconClass = "text-cyan-600 dark:text-cyan-400"

export const accentEmphasisClass = "text-cyan-800 dark:text-cyan-300"

export const accentHighlightClass = "text-cyan-700 dark:text-cyan-400"

export function stabilityBadgeClass(stability: string): string {
  if (stability === "high") {
    return "border-emerald-600/35 bg-emerald-500/15 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
  }
  if (stability === "medium") {
    return "border-amber-600/35 bg-amber-500/15 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
  }
  return "border-red-600/35 bg-red-500/15 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
}

/** System design — category pills */
export const sdCategoryBadgeClass: Record<string, string> = {
  storage: "border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
  caching: "border-amber-300 bg-amber-100 text-amber-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
  communication: "border-purple-300 bg-purple-100 text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400",
  reliability: "border-red-300 bg-red-100 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  scaling: "border-green-300 bg-green-100 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-400",
  "data-processing": "border-orange-300 bg-orange-100 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400",
  api: "border-cyan-300 bg-cyan-100 text-cyan-900 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-400",
  infrastructure: "border-border bg-muted text-foreground/80",
  consistency: "border-pink-300 bg-pink-100 text-pink-900 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-400",
  observability: "border-teal-300 bg-teal-100 text-teal-900 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-400",
}

export const sdPriorityBadgeClass = {
  mandatory:
    "border-red-300 bg-red-100 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  recommended:
    "border-amber-300 bg-amber-100 text-amber-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
  optional: "border-border bg-muted text-foreground/80 dark:text-muted-foreground",
} as const

export const sdPriorityIconClass = {
  mandatory: "text-red-600 dark:text-red-400",
  recommended: "text-amber-600 dark:text-yellow-400",
  optional: "text-muted-foreground",
} as const

export const sdComplexityTextClass = {
  low: "text-green-700 dark:text-green-400",
  medium: "text-amber-700 dark:text-yellow-400",
  high: "text-red-700 dark:text-red-400",
} as const

export const sdRiskCalloutClass =
  "mb-3 rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/30"

export const sdRiskCalloutTitleClass =
  "mb-1 text-xs font-semibold uppercase tracking-wide text-red-800 dark:text-red-400"

export const sdRiskCalloutBodyClass = "text-xs text-red-900 dark:text-red-300"

export const sdMandatoryCardBorderClass = "border-red-300 dark:border-red-900/50"

export const destructiveTextClass = "text-red-700 dark:text-red-400"

export const destructiveIconClass = "text-red-600 dark:text-red-400"

/** Primary CTA — e.g. Generate Architecture */
export const ctaButtonClass =
  "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 dark:bg-cyan-500 dark:text-black dark:shadow-cyan-500/20 dark:hover:bg-cyan-400"

/** Select / dropdown item highlight */
export const selectItemHighlightClass =
  "data-highlighted:bg-cyan-100 data-highlighted:text-cyan-950 focus:bg-cyan-100 focus:text-cyan-950 dark:data-highlighted:bg-cyan-500/25 dark:data-highlighted:text-cyan-50 dark:focus:bg-cyan-500/25 dark:focus:text-cyan-50"
