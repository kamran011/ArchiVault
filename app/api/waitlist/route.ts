import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceRoleClient } from "@/lib/supabase"
import { sendWaitlistConfirmationEmail } from "@/lib/waitlist-email"
import { WAITLIST_SPOT_LIMIT } from "@/lib/waitlist"

const bodySchema = z.object({
  email: z.string().trim().email().max(320),
  plan: z.enum(["blueprint", "pro", "team"]),
})

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email and plan are required" }, { status: 400 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const email = parsed.data.email.toLowerCase()
  const plan = parsed.data.plan

  const { count, error: countErr } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })

  if (countErr) {
    return NextResponse.json({ error: "Could not verify waitlist availability" }, { status: 500 })
  }

  if ((count ?? 0) >= WAITLIST_SPOT_LIMIT) {
    return NextResponse.json(
      { error: "Early-bird list is full. Paid tiers launch this week — check back soon." },
      { status: 409 },
    )
  }

  const { error: insertErr } = await supabase.from("waitlist").insert({
    email,
    plan,
  })

  const alreadyJoined = insertErr?.code === "23505"
  if (insertErr && !alreadyJoined) {
    return NextResponse.json({ error: "Could not join waitlist" }, { status: 500 })
  }

  const emailResult = await sendWaitlistConfirmationEmail(email, plan)
  if (!emailResult.ok) {
    const status = emailResult.error.includes("not configured") ? 503 : 502
    return NextResponse.json(
      {
        error:
          status === 503
            ? "Email service is not configured yet. Try again shortly."
            : "Could not send confirmation email. Check your address and try again.",
      },
      { status },
    )
  }

  return NextResponse.json({ ok: true, alreadyJoined })
}
