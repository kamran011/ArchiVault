import type { CheckoutPlan } from "@/lib/plans"

export const WAITLIST_SPOT_LIMIT = 50
export const WAITLIST_LAUNCH_DAYS = 3
export const PAID_TIERS_LAUNCH_SUBTEXT = "Payment processing launching this week"
export const PRICING_LAUNCH_BANNER =
  "Paid tiers launching this week. Join the waitlist for early-bird access."

export function waitlistLaunchTitle(plan: CheckoutPlan): string {
  const name = plan.charAt(0).toUpperCase() + plan.slice(1)
  return `${name} launches in ${WAITLIST_LAUNCH_DAYS} days`
}
