import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase"
import type { UserPlan } from "@/lib/plan-gate"
import { resolveSimulatedPlan, resolveSimulatedGenerationCount } from "@/lib/dev-plan-simulate"
import { paddleFetch } from "@/lib/paddle"
import {
  parseCancelsAtFromSubscription,
  type PaddleSubscriptionPayload,
} from "@/lib/paddle-plans"

type PaddleSubscriptionResponse = {
  data?: PaddleSubscriptionPayload
}

async function billingPeriodEndFromPaddle(subscriptionId: string): Promise<string | null> {
  try {
    const result = await paddleFetch<PaddleSubscriptionResponse>(
      `/subscriptions/${subscriptionId}`,
    )
    const sub = result.data
    if (!sub) return null
    return (
      parseCancelsAtFromSubscription(sub) ?? sub.current_billing_period?.ends_at ?? null
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
      "plan, generation_count, subscription_status, subscription_cancels_at, paddle_subscription_id",
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
    data?.paddle_subscription_id &&
    (plan === "pro" || plan === "team") &&
    subscriptionStatus !== "scheduled_cancellation"
  ) {
    const periodEnd = await billingPeriodEndFromPaddle(data.paddle_subscription_id)
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
