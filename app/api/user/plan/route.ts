import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase"
import type { UserPlan } from "@/lib/plan-gate"
import { resolveSimulatedPlan, resolveSimulatedGenerationCount } from "@/lib/dev-plan-simulate"
import { createPolarClient } from "@/lib/polar"
import { parseCancelsAtFromSubscription } from "@/lib/polar-plans"
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js"

async function billingPeriodEndFromPolar(subscriptionId: string): Promise<string | null> {
  try {
    const polar = createPolarClient()
    const sub = await polar.subscriptions.get({ id: subscriptionId })
    return (
      parseCancelsAtFromSubscription(sub as Subscription) ??
      sub.currentPeriodEnd?.toISOString() ??
      null
    )
  } catch {
    return null
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data, error } = await supabase
    .from("users")
    .select(
      "plan, generation_count, subscription_status, subscription_cancels_at, polar_subscription_id",
    )
    .eq("clerk_id", userId)
    .maybeSingle()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const plan = resolveSimulatedPlan((data?.plan ?? "free") as UserPlan)
  const rawCount = data?.generation_count ?? 0
  const generationCount = resolveSimulatedGenerationCount(typeof rawCount === "number" ? rawCount : 0)

  let subscriptionCancelsAt = data?.subscription_cancels_at ?? null
  const subscriptionStatus = data?.subscription_status ?? null

  if (
    !subscriptionCancelsAt &&
    data?.polar_subscription_id &&
    (plan === "pro" || plan === "team") &&
    subscriptionStatus !== "scheduled_cancellation"
  ) {
    const periodEnd = await billingPeriodEndFromPolar(data.polar_subscription_id)
    if (periodEnd) subscriptionCancelsAt = periodEnd
  }

  return NextResponse.json({
    plan,
    generationCount,
    subscriptionStatus,
    subscriptionCancelsAt,
    simulatedPlan: plan !== (data?.plan ?? "free"),
  })
}
