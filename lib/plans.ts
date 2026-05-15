import type { UserPlan } from "@/lib/plan-gate"

export type CheckoutPlan = "blueprint" | "pro" | "team"

export type PricingTier = {
  id: string
  name: string
  price: string
  priceSuffix?: string
  badge?: string
  description: string
  features: string[]
  checkoutPlan: CheckoutPlan | null
  cta: string
  href: string | null
  highlighted?: boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
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
    badge: "BEST FOR MVP",
    description: "Ship one product without a monthly subscription.",
    features: [
      "4 total generations (includes your free one)",
      "PDF export + saved history",
      "Full scaffold prompt for leading AI coding agents",
    ],
    checkoutPlan: "blueprint",
    cta: "Buy Blueprint",
    href: null,
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    priceSuffix: "/mo",
    description: "For builders iterating on features or multiple products.",
    features: [
      "Unlimited generations (fair use)",
      "Everything in Blueprint",
      "Tech stack analysis tab",
      "Priority model updates",
    ],
    checkoutPlan: "pro",
    cta: "Subscribe to Pro",
    href: null,
  },
  {
    id: "team",
    name: "Team",
    price: "$79",
    priceSuffix: "/mo",
    description: "For design reviews, agencies, and shared standards.",
    features: [
      "Everything in Pro",
      "System Design tab (patterns + risks)",
      "Scaling & data-flow summary",
      "Priority support",
    ],
    checkoutPlan: "team",
    cta: "Subscribe to Team",
    href: null,
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
  summary: string
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
        summary: "1/1 free generation used. Upgrade to continue.",
        detail:
          "You've used your 1 free generation. Upgrade to Blueprint ($49) for 4 more, or Pro ($29/mo) for unlimited.",
        ctaLabel: "Upgrade now",
        ctaHref: pricingHref,
      }
    case "blueprint":
      return {
        summary: "4/4 generations used.",
        detail:
          "You've used all four Blueprint-pack generations. Buy more Blueprint or upgrade to Pro for unlimited architectures.",
        ctaLabel: "View plans",
        ctaHref: pricingHref,
      }
    default:
      return {
        summary: "Generation limit reached.",
        detail: "Please upgrade your plan to continue.",
        ctaLabel: "View plans",
        ctaHref: pricingHref,
      }
  }
}

export function generationLimitMessage(plan: UserPlan): string {
  if (plan === "free") {
    return "Generation limit reached. Upgrade to Blueprint or Pro to continue."
  }
  if (plan === "blueprint") {
    return "Blueprint generations used. Upgrade to Pro for unlimited architectures."
  }
  return "Generation limit reached."
}

export function nextUpgradePlan(plan: UserPlan): CheckoutPlan | null {
  if (plan === "free") return "blueprint"
  if (plan === "blueprint") return "pro"
  if (plan === "pro") return "team"
  return null
}
