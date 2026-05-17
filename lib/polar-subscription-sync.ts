import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js"
import type { UserPlan } from "@/lib/plan-gate"
import {
  clerkIdFromPolar,
  paidPlanFromCheckoutMetadata,
  parseCancelsAtFromSubscription,
  resolvePlanFromSubscription,
  subscriptionPlanForStatus,
} from "@/lib/polar-plans"

export async function applySubscriptionCanceled(
  supabase: SupabaseClient,
  clerkId: string,
): Promise<void> {
  await supabase
    .from("users")
    .update({
      plan: "free",
      polar_subscription_id: null,
      polar_customer_id: null,
      subscription_status: null,
      subscription_cancels_at: null,
    })
    .eq("clerk_id", clerkId)
}

export async function applySubscriptionUpdated(
  supabase: SupabaseClient,
  sub: Subscription,
): Promise<void> {
  const clerkId = clerkIdFromPolar(sub.metadata as { [k: string]: unknown }, sub.customer)
  if (!clerkId || !sub.id) return

  const status = sub.status

  if (status === "canceled") {
    await applySubscriptionCanceled(supabase, clerkId)
    return
  }

  if (status === "past_due" || status === "unpaid") {
    await supabase
      .from("users")
      .update({
        plan: "free",
        polar_subscription_id: null,
        subscription_status: null,
        subscription_cancels_at: null,
      })
      .eq("clerk_id", clerkId)
    return
  }

  if (sub.cancelAtPeriodEnd && isSubscriptionActiveStatus(status)) {
    const cancelsAt = parseCancelsAtFromSubscription(sub)
    await supabase
      .from("users")
      .update({
        subscription_status: "scheduled_cancellation",
        subscription_cancels_at: cancelsAt,
        polar_subscription_id: sub.id,
        polar_customer_id: sub.customerId,
      })
      .eq("clerk_id", clerkId)
    return
  }

  if (isSubscriptionActiveStatus(status)) {
    const plan = subscriptionPlanForStatus(sub) as UserPlan
    if (plan === "free") return
    await supabase
      .from("users")
      .update({
        plan,
        polar_subscription_id: sub.id,
        polar_customer_id: sub.customerId,
        subscription_status: "active",
        subscription_cancels_at: null,
      })
      .eq("clerk_id", clerkId)
  }
}

function isSubscriptionActiveStatus(status: string | undefined): boolean {
  return status === "active" || status === "trialing"
}

export async function applySubscriptionActivated(
  supabase: SupabaseClient,
  sub: Subscription,
): Promise<void> {
  const clerkId = clerkIdFromPolar(sub.metadata as { [k: string]: unknown }, sub.customer)
  if (!clerkId || !sub.id) return

  const plan = resolvePlanFromSubscription(sub)
  if (!plan || plan === "free") return

  await supabase
    .from("users")
    .update({
      plan,
      polar_subscription_id: sub.id,
      polar_customer_id: sub.customerId,
      subscription_status: "active",
      subscription_cancels_at: null,
    })
    .eq("clerk_id", clerkId)
}

export async function applyOrderPaid(
  supabase: SupabaseClient,
  payload: {
    metadata?: { [k: string]: unknown } | null
    customer?: { externalId?: string | null; id?: string } | null
    productId?: string | null
    subscriptionId?: string | null
  },
): Promise<void> {
  const clerkId = clerkIdFromPolar(payload.metadata ?? undefined, payload.customer ?? undefined)
  const planRaw =
    typeof payload.metadata?.plan === "string" ? payload.metadata.plan : undefined
  const plan = paidPlanFromCheckoutMetadata(planRaw)
  if (!clerkId || !plan) return

  const isSubscription = plan === "pro" || plan === "team"

  await supabase
    .from("users")
    .update({
      plan,
      ...(payload.customer?.id ? { polar_customer_id: payload.customer.id } : {}),
      polar_subscription_id: isSubscription ? (payload.subscriptionId ?? null) : null,
      subscription_status: isSubscription ? "active" : null,
      subscription_cancels_at: null,
    })
    .eq("clerk_id", clerkId)
}
