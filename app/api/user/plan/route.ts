import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase"
import type { UserPlan } from "@/lib/plan-gate"
import { resolveSimulatedPlan, resolveSimulatedGenerationCount } from "@/lib/dev-plan-simulate"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data, error } = await supabase
    .from("users")
    .select("plan, generation_count")
    .eq("clerk_id", userId)
    .maybeSingle()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const plan = resolveSimulatedPlan((data?.plan ?? "free") as UserPlan)
  const rawCount = data?.generation_count ?? 0
  const generationCount = resolveSimulatedGenerationCount(typeof rawCount === "number" ? rawCount : 0)

  return NextResponse.json({
    plan,
    generationCount,
    simulatedPlan: plan !== (data?.plan ?? "free"),
  })
}
