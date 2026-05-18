import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { guestCookieClearHeader, parseGuestToken } from "@/lib/guest-cookie"
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

  const { data: guestRow, error: guestErr } = await supabase
    .from("guest_generations")
    .select("id, description, result, claimed_by_clerk_id")
    .eq("guest_token", guestToken)
    .maybeSingle()

  if (guestErr) {
    console.error(guestErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!guestRow || guestRow.claimed_by_clerk_id) {
    return NextResponse.json({ claimed: false, reason: "nothing_to_claim" })
  }

  const { data: user } = await supabase
    .from("users")
    .select("generation_count")
    .eq("clerk_id", userId)
    .maybeSingle()

  if (!user) {
    await supabase.from("users").insert({ clerk_id: userId, generation_count: 0 })
  }

  const currentCount = user?.generation_count ?? 0

  const { data: inserted, error: genErr } = await supabase
    .from("generations")
    .insert({
      clerk_id: userId,
      description: guestRow.description,
      result: guestRow.result as Architecture,
    })
    .select("id")
    .single()

  if (genErr || !inserted) {
    console.error(genErr)
    return NextResponse.json({ error: "Failed to claim generation" }, { status: 500 })
  }

  await supabase
    .from("guest_generations")
    .update({ claimed_by_clerk_id: userId })
    .eq("id", guestRow.id)

  if (currentCount === 0) {
    await supabase
      .from("users")
      .update({
        generation_count: 1,
        last_generation_at: new Date().toISOString(),
      })
      .eq("clerk_id", userId)
  }

  const res = NextResponse.json({ claimed: true, generationId: inserted.id })
  res.headers.append("Set-Cookie", guestCookieClearHeader())
  return res
}
