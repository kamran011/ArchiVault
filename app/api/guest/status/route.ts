import { NextResponse } from "next/server"
import { parseGuestToken } from "@/lib/guest-cookie"
import { getServiceRoleClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const guestToken = parseGuestToken(req.headers.get("cookie"))
  if (!guestToken) {
    return NextResponse.json({ hasUsedGuestBlueprint: false })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data, error } = await supabase
    .from("guest_generations")
    .select("id, claimed_by_clerk_id")
    .eq("guest_token", guestToken)
    .maybeSingle()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  return NextResponse.json({
    hasUsedGuestBlueprint: Boolean(data),
    claimed: Boolean(data?.claimed_by_clerk_id),
  })
}
