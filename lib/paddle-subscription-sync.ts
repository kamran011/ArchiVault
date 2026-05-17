import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { UserPlan } from "@/lib/plan-gate"
import {
  clerkIdFromCustomData,
  parseCancelsAtFromSubscription,
  resolvePlanFromSubscription,
  subscriptionPlanForStatus,
  type PaddleSubscriptionPayload,
} from "@/lib/paddle-plans"

export async function applySubscriptionCanceled(
  supabase: SupabaseClient,
  clerkId: string,
): Promise<void> {
  await supabase
    .from("users")
    .update({
      plan: "free",
      paddle_subscription_id: null,
      paddle_customer_id: null,
      subscription_status: null,
      subscription_cancels_at: null,
    })
    .eq("clerk_id", clerkId)
}

export async function applySubscriptionUpdated(
  supabase: SupabaseClient,
  sub: PaddleSubscriptionPayload,
): Promise<void> {
  const clerkId = clerkIdFromCustomData(sub.custom_data ?? undefined)
  if (!clerkId || !sub.id) return

  const status = sub.status

  if (status === "canceled") {
    await applySubscriptionCanceled(supabase, clerkId)
    return
  }

  if (status === "past_due" || status === "paused") {
    await supabase
      .from("users")
      .update({
        plan: "free",
        paddle_subscription_id: null,
        subscription_status: null,
        subscription_cancels_at: null,
      })
      .eq("clerk_id", clerkId)
    return
  }

  const scheduledCancel = sub.scheduled_change?.action === "cancel"
  if (scheduledCancel && isSubscriptionActiveStatus(status)) {
    const cancelsAt = parseCancelsAtFromSubscription(sub)
    await supabase
      .from("users")
      .update({
        subscription_status: "scheduled_cancellation",
        subscription_cancels_at: cancelsAt,
        paddle_subscription_id: sub.id,
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
        paddle_subscription_id: sub.id,
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
  sub: PaddleSubscriptionPayload,
): Promise<void> {
  const clerkId = clerkIdFromCustomData(sub.custom_data ?? undefined)
  if (!clerkId || !sub.id) return

  const plan = resolvePlanFromSubscription(sub)
  if (!plan || plan === "free") return

  await supabase
    .from("users")
    .update({
      plan,
      paddle_subscription_id: sub.id,
      subscription_status: "active",
      subscription_cancels_at: null,
    })
    .eq("clerk_id", clerkId)
}

export async function applyTransactionCompleted(
  supabase: SupabaseClient,
  payload: {
    custom_data?: { clerk_id?: string; plan?: string } | null
    subscription_id?: string | null
    customer_id?: string | null
  },
): Promise<void> {
  const clerkId = clerkIdFromCustomData(payload.custom_data ?? undefined)
  const plan = payload.custom_data?.plan
  if (!clerkId || (plan !== "blueprint" && plan !== "pro" && plan !== "team")) return

  const isSubscription = plan === "pro" || plan === "team"

  await supabase
    .from("users")
    .update({
      plan,
      ...(payload.customer_id ? { paddle_customer_id: payload.customer_id } : {}),
      paddle_subscription_id: isSubscription ? (payload.subscription_id ?? null) : null,
      subscription_status: isSubscription ? "active" : null,
      subscription_cancels_at: null,
    })
    .eq("clerk_id", clerkId)
}
