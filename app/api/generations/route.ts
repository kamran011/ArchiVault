import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase"
import { redactArchitectureForPlan, type UserPlan } from "@/lib/plan-gate"
import { resolveSimulatedPlan } from "@/lib/dev-plan-simulate"
import type { Architecture } from "@/types/architecture"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("plan")
    .eq("clerk_id", userId)
    .maybeSingle()

  if (userErr) {
    console.error(userErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const plan = resolveSimulatedPlan((userRow?.plan ?? "free") as UserPlan)

  const { data, error } = await supabase
    .from("generations")
    .select("id, description, result, created_at, tech_stack")
    .eq("clerk_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const generations = (data ?? []).map((row) => ({
    ...row,
    result: redactArchitectureForPlan(row.result as Architecture, plan),
  }))

  return NextResponse.json({ generations })
}
