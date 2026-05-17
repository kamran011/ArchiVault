import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { paddleFetch, PaddleApiError } from "@/lib/paddle"
import { parseCancelsAtFromSubscription, type PaddleSubscriptionPayload } from "@/lib/paddle-plans"
import { getServiceRoleClient } from "@/lib/supabase"

type PaddleSubscriptionResponse = {
  data?: PaddleSubscriptionPayload
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data: user, error: loadErr } = await supabase
    .from("users")
    .select("plan, paddle_subscription_id, subscription_status")
    .eq("clerk_id", userId)
    .maybeSingle()

  if (loadErr) {
    console.error(loadErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const plan = user?.plan
  if (plan !== "pro" && plan !== "team") {
    return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 })
  }

  const subId = user?.paddle_subscription_id
  if (!subId) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 400 })
  }

  if (user?.subscription_status === "scheduled_cancellation") {
    return NextResponse.json({ error: "Subscription is already scheduled to cancel" }, { status: 400 })
  }

  try {
    const result = await paddleFetch<PaddleSubscriptionResponse>(`/subscriptions/${subId}`, {
      method: "PATCH",
      body: JSON.stringify({
        scheduled_change: { action: "cancel" },
      }),
    })

    const sub = result.data
    const cancelsAt = sub ? parseCancelsAtFromSubscription(sub) : null

    const { error: updateErr } = await supabase
      .from("users")
      .update({
        subscription_status: "scheduled_cancellation",
        subscription_cancels_at: cancelsAt,
      })
      .eq("clerk_id", userId)

    if (updateErr) {
      console.error("[paddle cancel] db update failed:", updateErr)
      return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Subscription scheduled to cancel",
      cancelsAt,
    })
  } catch (e) {
    console.error(e)
    if (e instanceof PaddleApiError) {
      return NextResponse.json({ error: e.message }, { status: 502 })
    }
    return NextResponse.json({ error: "Could not cancel subscription" }, { status: 502 })
  }
}
