import { Webhooks } from "@polar-sh/nextjs"
import { NextResponse } from "next/server"
import {
  applyOrderPaid,
  applySubscriptionActivated,
  applySubscriptionCanceled,
  applySubscriptionUpdated,
} from "@/lib/polar-subscription-sync"
import { clerkIdFromPolar } from "@/lib/polar-plans"
import { getPolarWebhookSecret } from "@/lib/polar"
import { getServiceRoleClient } from "@/lib/supabase"

export const runtime = "nodejs"

export const POST = Webhooks({
  webhookSecret: getPolarWebhookSecret() ?? "",
  onOrderPaid: async (payload) => {
    const supabase = getServiceRoleClient()
    if (supabase instanceof NextResponse) return
    const order = payload.data
    await applyOrderPaid(supabase, {
      metadata: order.metadata as { [k: string]: unknown },
      customer: order.customer,
      productId: order.productId,
      subscriptionId: order.subscriptionId,
    })
  },
  onSubscriptionActive: async (payload) => {
    const supabase = getServiceRoleClient()
    if (supabase instanceof NextResponse) return
    await applySubscriptionActivated(supabase, payload.data)
  },
  onSubscriptionCreated: async (payload) => {
    const supabase = getServiceRoleClient()
    if (supabase instanceof NextResponse) return
    await applySubscriptionActivated(supabase, payload.data)
  },
  onSubscriptionUpdated: async (payload) => {
    const supabase = getServiceRoleClient()
    if (supabase instanceof NextResponse) return
    await applySubscriptionUpdated(supabase, payload.data)
  },
  onSubscriptionCanceled: async (payload) => {
    const supabase = getServiceRoleClient()
    if (supabase instanceof NextResponse) return
    const sub = payload.data
    const clerkId = clerkIdFromPolar(
      sub.metadata as { [k: string]: unknown },
      sub.customer,
    )
    if (!clerkId) return
    if (sub.cancelAtPeriodEnd && (sub.status === "active" || sub.status === "trialing")) {
      await applySubscriptionUpdated(supabase, sub)
      return
    }
    await applySubscriptionCanceled(supabase, clerkId)
  },
  onSubscriptionRevoked: async (payload) => {
    const supabase = getServiceRoleClient()
    if (supabase instanceof NextResponse) return
    const clerkId = clerkIdFromPolar(
      payload.data.metadata as { [k: string]: unknown },
      payload.data.customer,
    )
    if (clerkId) await applySubscriptionCanceled(supabase, clerkId)
  },
})
