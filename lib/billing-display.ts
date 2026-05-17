import type { UserPlan } from "@/lib/plan-gate"
import { PRICING_TIERS, type PricingTier } from "@/lib/plans"
import { planDisplayName } from "@/lib/format-subscription-date"

export function pricingTierForPlan(plan: UserPlan): PricingTier | null {
  return PRICING_TIERS.find((t) => t.id === plan) ?? null
}

export function planFeatures(plan: UserPlan): string[] {
  const tier = pricingTierForPlan(plan)
  if (tier) return tier.features
  if (plan === "free") {
    return PRICING_TIERS.find((t) => t.id === "free")?.features ?? []
  }
  return []
}

export function planPriceLabel(plan: UserPlan): string {
  const tier = pricingTierForPlan(plan)
  if (!tier) return "$0"
  return `${tier.price}${tier.priceSuffix ?? ""}`
}

export function planHeadline(plan: UserPlan): string {
  return `${planDisplayName(plan)} Plan`
}

export function isRecurringSubscription(plan: UserPlan): boolean {
  return plan === "pro" || plan === "team"
}
