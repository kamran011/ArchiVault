import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import {
  canAccessScaffoldPrompt,
  canAccessSystemDesign,
  canAccessTechStack,
  type UserPlan,
} from "@/lib/plan-gate"
import { resolveSimulatedPlan } from "@/lib/dev-plan-simulate"
import { getServiceRoleClient } from "@/lib/supabase"
import { z } from "zod"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data, error: fetchErr } = await supabase
    .from("generations")
    .select("clerk_id")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr) {
    console.error(fetchErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (data.clerk_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error: deleteErr } = await supabase.from("generations").delete().eq("id", id)

  if (deleteErr) {
    console.error(deleteErr)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

const patchSchema = z.object({
  result: z.record(z.string(), z.unknown()),
})

export async function PATCH(req: Request, context: RouteContext) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data: existing, error: fetchErr } = await supabase
    .from("generations")
    .select("clerk_id, result")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr) {
    console.error(fetchErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (existing.clerk_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

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
  if ("scaffoldPrompt" in body.result && !canAccessScaffoldPrompt(plan)) {
    return NextResponse.json({ error: "Scaffold prompt requires Blueprint plan or higher" }, { status: 403 })
  }
  if ("techStackAnalysis" in body.result && !canAccessTechStack(plan)) {
    return NextResponse.json({ error: "Tech Stack analysis requires Pro plan" }, { status: 403 })
  }
  if ("systemDesign" in body.result && !canAccessSystemDesign(plan)) {
    return NextResponse.json({ error: "System Design requires Team plan" }, { status: 403 })
  }

  const merged = {
    ...(existing.result as Record<string, unknown>),
    ...body.result,
  }

  const { error: updateErr } = await supabase
    .from("generations")
    .update({ result: merged })
    .eq("id", id)

  if (updateErr) {
    console.error(updateErr)
    return NextResponse.json({ error: "Failed to update generation" }, { status: 500 })
  }

  return NextResponse.json({ result: merged })
}
