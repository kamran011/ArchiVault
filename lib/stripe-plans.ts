import type { UserPlan } from "@/lib/plan-gate"
import type { CheckoutPlan } from "@/lib/plans"
import type Stripe from "stripe"

/** Map Stripe price IDs from env to internal plan ids. */
export function planFromPriceId(priceId: string | undefined | null): UserPlan | null {
  if (!priceId) return null
  const team = process.env.STRIPE_TEAM_PRICE_ID?.trim()
  const pro = process.env.STRIPE_PRO_PRICE_ID?.trim()
  const blueprint = process.env.STRIPE_BLUEPRINT_PRICE_ID?.trim()
  if (team && priceId === team) return "team"
  if (pro && priceId === pro) return "pro"
  if (blueprint && priceId === blueprint) return "blueprint"
  return null
}

export function planFromSubscriptionMetadata(
  metadata: Stripe.Metadata | null | undefined,
): CheckoutPlan | null {
  const plan = metadata?.plan
  if (plan === "blueprint" || plan === "pro" || plan === "team") return plan
  return null
}

export function resolvePlanFromSubscription(sub: Stripe.Subscription): UserPlan | null {
  const fromMeta = planFromSubscriptionMetadata(sub.metadata)
  if (fromMeta) return fromMeta
  const priceId = sub.items.data[0]?.price?.id
  return planFromPriceId(priceId)
}

export function isSubscriptionActive(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing"
}
