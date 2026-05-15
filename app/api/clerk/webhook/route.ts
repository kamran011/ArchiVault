import { verifyWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

/**
 * Production Clerk webhook: https://archivolt.dev/api/clerk/webhook
 * Configure in Clerk Dashboard and set CLERK_WEBHOOK_SIGNING_SECRET.
 * Logs events only for now (user.created, user.updated, user.deleted, etc.).
 */
export async function POST(req: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return new Response("Missing CLERK_WEBHOOK_SIGNING_SECRET", { status: 500 })
  }

  try {
    const evt = await verifyWebhook(req)
    console.log("Clerk webhook event:", evt.type)
    return new Response("Webhook received", { status: 200 })
  } catch (err) {
    console.error("Clerk webhook verification failed:", err)
    return new Response("Webhook verification failed", { status: 400 })
  }
}
