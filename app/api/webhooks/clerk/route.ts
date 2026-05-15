import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { type NextRequest, NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase"

/**
 * Legacy path — production uses POST /api/clerk/webhook (log-only for now).
 * This route still syncs Clerk users into Supabase if you point a webhook here.
 * Set CLERK_WEBHOOK_SIGNING_SECRET in the environment.
 */
export async function POST(req: NextRequest) {
  let evt: Awaited<ReturnType<typeof verifyWebhook>>
  try {
    evt = await verifyWebhook(req)
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const primary = evt.data.email_addresses?.find(
        (e) => e.id === evt.data.primary_email_address_id,
      )
      const email =
        primary?.email_address ?? evt.data.email_addresses?.[0]?.email_address ?? null

      const { error } = await supabase.from("users").upsert(
        {
          clerk_id: evt.data.id,
          email,
        },
        { onConflict: "clerk_id" },
      )

      if (error) {
        console.error(error)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }
      break
    }
    case "user.deleted": {
      const id = evt.data.id
      if (!id) break

      const { error } = await supabase.from("users").delete().eq("clerk_id", id)
      if (error) {
        console.error(error)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
