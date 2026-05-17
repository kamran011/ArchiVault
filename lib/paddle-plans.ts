import type { UserPlan } from "@/lib/plan-gate"
import type { CheckoutPlan } from "@/lib/plans"

export type SubscriptionStatus = "active" | "scheduled_cancellation" | null

export type PaddleCustomData = {
  clerk_id?: string
  plan?: string
}

export type PaddleSubscriptionPayload = {
  id?: string
  status?: string
  custom_data?: PaddleCustomData | null
  scheduled_change?: { action?: string; effective_at?: string } | null
  current_billing_period?: { ends_at?: string } | null
  items?: Array<{ price?: { id?: string } }>
}

/** Map Paddle price IDs from env to internal plan ids. */
export function planFromPriceId(priceId: string | undefined | null): UserPlan | null {
  if (!priceId) return null
  const team = process.env.PADDLE_TEAM_PRICE_ID?.trim()
  const pro = process.env.PADDLE_PRO_PRICE_ID?.trim()
  const blueprint = process.env.PADDLE_BLUEPRINT_PRICE_ID?.trim()
  if (team && priceId === team) return "team"
  if (pro && priceId === pro) return "pro"
  if (blueprint && priceId === blueprint) return "blueprint"
  return null
}

export function planFromCustomData(
  customData: PaddleCustomData | null | undefined,
): CheckoutPlan | null {
  const plan = customData?.plan
  if (plan === "blueprint" || plan === "pro" || plan === "team") return plan
  return null
}

export function resolvePlanFromSubscription(sub: PaddleSubscriptionPayload): UserPlan | null {
  const fromMeta = planFromCustomData(sub.custom_data ?? undefined)
  if (fromMeta) return fromMeta
  const priceId = sub.items?.[0]?.price?.id
  return planFromPriceId(priceId)
}

export function isSubscriptionActive(status: string | undefined): boolean {
  return status === "active" || status === "trialing"
}

/** Plan for webhook updates: canceled/past_due → free; active → resolved plan. */
export function subscriptionPlanForStatus(sub: PaddleSubscriptionPayload): UserPlan {
  const status = sub.status
  if (status === "canceled") return "free"
  if (status === "past_due" || status === "paused") return "free"
  if (isSubscriptionActive(status)) {
    return resolvePlanFromSubscription(sub) ?? "free"
  }
  return "free"
}

export function parseCancelsAtFromSubscription(sub: PaddleSubscriptionPayload): string | null {
  const scheduled = sub.scheduled_change
  if (scheduled?.action === "cancel" && scheduled.effective_at) {
    return scheduled.effective_at
  }
  return sub.current_billing_period?.ends_at ?? null
}

export function clerkIdFromCustomData(
  customData: PaddleCustomData | null | undefined,
): string | null {
  const id = customData?.clerk_id
  return typeof id === "string" && id.length > 0 ? id : null
}
