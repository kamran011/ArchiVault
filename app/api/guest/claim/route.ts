import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { guestCookieClearHeader, parseGuestToken } from "@/lib/guest-cookie"
import { releaseGenerationSlot, reserveGenerationSlot } from "@/lib/generation-quota"
import { resolveSimulatedPlan } from "@/lib/dev-plan-simulate"
import type { UserPlan } from "@/lib/plan-gate"
import { generationLimitMessage } from "@/lib/plans"
import { getServiceRoleClient } from "@/lib/supabase"
import type { Architecture } from "@/types/architecture"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const guestToken = parseGuestToken(req.headers.get("cookie"))
  if (!guestToken) {
    return NextResponse.json({ claimed: false, reason: "no_guest_token" })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data: claimedGuest, error: claimErr } = await supabase
    .from("guest_generations")
    .update({ claimed_by_clerk_id: userId })
    .eq("guest_token", guestToken)
    .is("claimed_by_clerk_id", null)
    .select("id, description, result")
    .maybeSingle()

  if (claimErr) {
    console.error(claimErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!claimedGuest) {
    return NextResponse.json({ claimed: false, reason: "nothing_to_claim" })
  }

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("plan, generation_count")
    .eq("clerk_id", userId)
    .maybeSingle()

  if (userErr) {
    console.error(userErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!user) {
    await supabase.from("users").insert({ clerk_id: userId, generation_count: 0 })
  }

  const plan = resolveSimulatedPlan((user?.plan ?? "free") as UserPlan)
  const generationCount = user?.generation_count ?? 0

  const quota = await reserveGenerationSlot(supabase, userId, plan, generationCount)
  if (!quota.ok) {
    await supabase
      .from("guest_generations")
      .update({ claimed_by_clerk_id: null })
      .eq("id", claimedGuest.id)
      .eq("claimed_by_clerk_id", userId)

    if (quota.reason === "limit_reached") {
      return NextResponse.json({ error: generationLimitMessage(plan) }, { status: 403 })
    }
    return NextResponse.json({ error: "Could not claim guest blueprint" }, { status: 409 })
  }

  const { data: inserted, error: genErr } = await supabase
    .from("generations")
    .insert({
      clerk_id: userId,
      description: claimedGuest.description,
      result: claimedGuest.result as Architecture,
    })
    .select("id")
    .single()

  if (genErr || !inserted) {
    console.error(genErr)
    await releaseGenerationSlot(supabase, userId, quota.previousCount)
    await supabase
      .from("guest_generations")
      .update({ claimed_by_clerk_id: null })
      .eq("id", claimedGuest.id)
      .eq("claimed_by_clerk_id", userId)
    return NextResponse.json({ error: "Failed to claim generation" }, { status: 500 })
  }

  const res = NextResponse.json({ claimed: true, generationId: inserted.id })
  res.headers.append("Set-Cookie", guestCookieClearHeader())
  return res
}
