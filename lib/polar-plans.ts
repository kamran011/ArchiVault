import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js"
import type { UserPlan } from "@/lib/plan-gate"
import type { CheckoutPlan } from "@/lib/plans"

export type PolarMetadata = {
  clerk_id?: string
  plan?: string
}

export type PolarCustomerRef = {
  externalId?: string | null
}

/** Map Polar product IDs from env to internal plan ids. */
export function planFromProductId(productId: string | undefined | null): UserPlan | null {
  if (!productId) return null
  const team = process.env.POLAR_TEAM_PRODUCT_ID?.trim()
  const pro = process.env.POLAR_PRO_PRODUCT_ID?.trim()
  const blueprint = process.env.POLAR_BLUEPRINT_PRODUCT_ID?.trim()
  const test = process.env.POLAR_TEST_PRODUCT_ID?.trim()
  if (team && productId === team) return "team"
  if (pro && productId === pro) return "pro"
  if (blueprint && productId === blueprint) return "blueprint"
  if (test && productId === test) return "blueprint"
  return null
}

export function productIdForPlan(plan: CheckoutPlan): string | undefined {
  if (plan === "test") return process.env.POLAR_TEST_PRODUCT_ID?.trim()
  if (plan === "blueprint") return process.env.POLAR_BLUEPRINT_PRODUCT_ID?.trim()
  if (plan === "pro") return process.env.POLAR_PRO_PRODUCT_ID?.trim()
  return process.env.POLAR_TEAM_PRODUCT_ID?.trim()
}

/** Maps checkout metadata plan to Supabase `users.plan`. */
export function paidPlanFromCheckoutMetadata(plan: string | undefined): UserPlan | null {
  if (plan === "blueprint" || plan === "pro" || plan === "team") return plan
  if (plan === "test") return "blueprint"
  return null
}

function metadataValue(v: unknown): string | undefined {
  if (typeof v === "string" && v.length > 0) return v
  return undefined
}

export function planFromMetadata(
  metadata: { [k: string]: unknown } | null | undefined,
): CheckoutPlan | null {
  const plan = metadataValue(metadata?.plan)
  if (plan === "blueprint" || plan === "pro" || plan === "team" || plan === "test") return plan
  return null
}

export function clerkIdFromPolar(
  metadata: { [k: string]: unknown } | null | undefined,
  customer?: PolarCustomerRef | null,
): string | null {
  const fromMeta = metadataValue(metadata?.clerk_id)
  if (fromMeta) return fromMeta
  const external = customer?.externalId
  if (typeof external === "string" && external.length > 0) return external
  return null
}

export function resolvePlanFromSubscription(sub: Subscription): UserPlan | null {
  const fromMeta = planFromMetadata(sub.metadata as { [k: string]: unknown })
  if (fromMeta === "test") return "blueprint"
  if (fromMeta) return fromMeta
  return planFromProductId(sub.productId)
}

export function isSubscriptionActive(status: string | undefined): boolean {
  return status === "active" || status === "trialing"
}

export function subscriptionPlanForStatus(sub: Subscription): UserPlan {
  const status = sub.status
  if (
    status === "canceled" ||
    status === "past_due" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  ) {
    return "free"
  }
  if (isSubscriptionActive(status)) {
    return resolvePlanFromSubscription(sub) ?? "free"
  }
  return "free"
}

export function parseCancelsAtFromSubscription(sub: Subscription): string | null {
  if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd) {
    return sub.currentPeriodEnd.toISOString()
  }
  if (sub.endsAt) return sub.endsAt.toISOString()
  return sub.currentPeriodEnd?.toISOString() ?? null
}
