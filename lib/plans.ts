import type { UserPlan } from "@/lib/plan-gate"

export type CheckoutPlan = "blueprint" | "pro" | "team"

export type PricingTier = {
  id: string
  name: string
  price: string
  priceSuffix?: string
  badge?: string
  /** Shown when checkout is not live yet (e.g. "Coming Soon"). */
  statusBadge?: string
  launchSubtext?: string
  description: string
  features: string[]
  checkoutPlan: CheckoutPlan | null
  cta: string
  href: string | null
  highlighted?: boolean
  comingSoon?: boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    badge: "BEST FOR MVP",
    description: "Validate the methodology on one real system.",
    features: [
      "1 architecture generation",
      "Volatility map + Mermaid diagram",
      "Future-proof score with rationale",
    ],
    checkoutPlan: null,
    cta: "Start free",
    href: "/sign-up",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    price: "$49",
    priceSuffix: " once",
    badge: "BEST FOR BUILDERS",
    statusBadge: "Coming Soon",
    launchSubtext: "Payment processing launching this week",
    description: "Ship one product without a monthly subscription.",
    features: [
      "4 total generations (includes your free one)",
      "PDF export + saved history",
      "Full scaffold prompt for AI coding agents",
    ],
    checkoutPlan: "blueprint",
    cta: "Join Waitlist",
    href: null,
    comingSoon: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    priceSuffix: "/mo",
    badge: "MOST POPULAR",
    statusBadge: "Coming Soon",
    launchSubtext: "Payment processing launching this week",
    description: "For teams iterating on multiple products.",
    features: [
      "Unlimited generations (fair use)",
      "Everything in Blueprint",
      "Tech stack analysis tab",
    ],
    checkoutPlan: "pro",
    cta: "Join Waitlist",
    href: null,
    highlighted: true,
    comingSoon: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    priceSuffix: "/mo",
    badge: "FOR TEAMS",
    statusBadge: "Coming Soon",
    launchSubtext: "Payment processing launching this week",
    description: "For design reviews, agencies, and shared standards.",
    features: [
      "Everything in Pro",
      "System Design tab (patterns + risks)",
      "Scaling & data-flow summary",
    ],
    checkoutPlan: "team",
    cta: "Join Waitlist",
    href: null,
    comingSoon: true,
  },
]

/** Max lifetime core generations; `null` = unlimited (pro/team). */
export function generationLimitForPlan(plan: UserPlan): number | null {
  if (plan === "free") return 1
  if (plan === "blueprint") return 4
  if (plan === "pro" || plan === "team") return null
  return null
}

export function isGenerationAllowed(plan: UserPlan, generationCount: number): boolean {
  const limit = generationLimitForPlan(plan)
  if (limit === null) return true
  return generationCount < limit
}

/** True when lifetime generation_count has reached this plan cap (requires server-side counter). */
export function isGenerationLimitReached(plan: UserPlan, generationCount: number): boolean {
  return !isGenerationAllowed(plan, generationCount)
}

export type GenerationLimitUi = {
  /** Display name: Free, Blueprint, Pro, Team */
  planLabel: string
  /** Short usage for hero hint only, e.g. "1/1 generation used". */
  usageHint: string
  /** Usage line (longer context; API / internal). */
  summary: string
  /** Upgrade path sentence(s); optional if summary is fully self-contained. */
  detail: string
  ctaLabel: string
  ctaHref: string
}

/** Copy shown when limit is reached; only call when limit reached so Pro/Team return null-safe defaults. */
export function generationLimitUi(plan: UserPlan): GenerationLimitUi {
  const pricingHref = "/#pricing"

  switch (plan) {
    case "free":
      return {
        planLabel: "Free",
        usageHint: "1/1 generation used",
        summary: "1/1 free generation used.",
        detail:
          "Upgrade to Blueprint ($49) for 4 more, or Pro ($29/mo) for unlimited.",
        ctaLabel: "Upgrade now",
        ctaHref: pricingHref,
      }
    case "blueprint":
      return {
        planLabel: "Blueprint",
        usageHint: "4/4 generations used",
        summary: "4/4 generations used.",
        detail: "Buy more Blueprint or upgrade to Pro for unlimited architectures.",
        ctaLabel: "Upgrade now",
        ctaHref: pricingHref,
      }
    default:
      return {
        planLabel: plan.charAt(0).toUpperCase() + plan.slice(1),
        usageHint: "Generation limit reached",
        summary: "Generation limit reached.",
        detail: "Upgrade your plan below to continue.",
        ctaLabel: "Upgrade now",
        ctaHref: pricingHref,
      }
  }
}

/** Single string for API errors (403). */
export function generationLimitMessage(plan: UserPlan): string {
  const ui = generationLimitUi(plan)
  const body = [ui.summary, ui.detail].filter((s) => s.length > 0).join(" ")
  return `${ui.planLabel} plan: ${body}`
}

export function nextUpgradePlan(plan: UserPlan): CheckoutPlan | null {
  if (plan === "free") return "blueprint"
  if (plan === "blueprint") return "pro"
  if (plan === "pro") return "team"
  return null
}
