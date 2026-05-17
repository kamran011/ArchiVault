import { NextRequest, NextResponse } from "next/server"
import { verifyPaddleWebhookSignature } from "@/lib/paddle-webhook"
import {
  applySubscriptionActivated,
  applySubscriptionCanceled,
  applySubscriptionUpdated,
  applyTransactionCompleted,
} from "@/lib/paddle-subscription-sync"
import { clerkIdFromCustomData, type PaddleSubscriptionPayload } from "@/lib/paddle-plans"
import { getServiceRoleClient } from "@/lib/supabase"

export const runtime = "nodejs"

type PaddleWebhookEvent = {
  event_type?: string
  event_id?: string
  data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get("paddle-signature")

  if (!verifyPaddleWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  let event: PaddleWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaddleWebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const eventType = event.event_type ?? ""
  const data = event.data ?? {}

  try {
    if (eventType === "transaction.completed") {
      const customData = data.custom_data as { clerk_id?: string; plan?: string } | undefined
      await applyTransactionCompleted(supabase, {
        custom_data: customData ?? null,
        subscription_id: typeof data.subscription_id === "string" ? data.subscription_id : null,
        customer_id: typeof data.customer_id === "string" ? data.customer_id : null,
      })
    } else if (
      eventType === "subscription.activated" ||
      eventType === "subscription.created"
    ) {
      await applySubscriptionActivated(supabase, data as PaddleSubscriptionPayload)
    } else if (eventType === "subscription.updated") {
      await applySubscriptionUpdated(supabase, data as PaddleSubscriptionPayload)
    } else if (eventType === "subscription.canceled") {
      const clerkId = clerkIdFromCustomData(
        (data.custom_data as { clerk_id?: string }) ?? undefined,
      )
      if (clerkId) {
        await applySubscriptionCanceled(supabase, clerkId)
      }
    } else if (eventType === "subscription.past_due") {
      const clerkId = clerkIdFromCustomData(
        (data.custom_data as { clerk_id?: string }) ?? undefined,
      )
      if (clerkId) {
        await applySubscriptionCanceled(supabase, clerkId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error("[paddle webhook]", eventType, e)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
