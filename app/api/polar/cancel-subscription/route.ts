import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createPolarClient } from "@/lib/polar"
import { parseCancelsAtFromSubscription } from "@/lib/polar-plans"
import { getServiceRoleClient } from "@/lib/supabase"

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data: user, error: loadErr } = await supabase
    .from("users")
    .select("plan, polar_subscription_id, subscription_status")
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

  const subId = user?.polar_subscription_id
  if (!subId) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 400 })
  }

  if (user?.subscription_status === "scheduled_cancellation") {
    return NextResponse.json({ error: "Subscription is already scheduled to cancel" }, { status: 400 })
  }

  try {
    const polar = createPolarClient()
    const sub = await polar.subscriptions.update({
      id: subId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
      },
    })

    const cancelsAt = parseCancelsAtFromSubscription(sub)

    const { error: updateErr } = await supabase
      .from("users")
      .update({
        subscription_status: "scheduled_cancellation",
        subscription_cancels_at: cancelsAt,
      })
      .eq("clerk_id", userId)

    if (updateErr) {
      console.error("[polar cancel] db update failed:", updateErr)
      return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Subscription scheduled to cancel",
      cancelsAt,
    })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : "Could not cancel subscription"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
