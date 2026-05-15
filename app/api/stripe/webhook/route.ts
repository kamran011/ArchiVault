import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import {
  isSubscriptionActive,
  planFromSubscriptionMetadata,
  resolvePlanFromSubscription,
} from "@/lib/stripe-plans"
import type { UserPlan } from "@/lib/plan-gate"
import { getServiceRoleClient } from "@/lib/supabase"

export const runtime = "nodejs"

async function stripeEvent(request: NextRequest): Promise<{ event?: Stripe.Event; error?: string }> {
  const stripe = getStripe()
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return { error: "Missing stripe signature or webhook secret" }
  }

  try {
    return {
      event: stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET),
    }
  } catch (err) {
    console.error(err)
    return { error: "Invalid signature" }
  }
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const legacy = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null
  }
  const subRaw = legacy.subscription
  if (typeof subRaw === "string") return subRaw
  if (subRaw && typeof subRaw === "object" && "id" in subRaw) return subRaw.id

  const lineSub = invoice.lines?.data?.[0]?.subscription
  if (typeof lineSub === "string") return lineSub
  if (lineSub && typeof lineSub === "object" && "id" in lineSub) return lineSub.id
  return null
}

function subscriptionPlanForStatus(sub: Stripe.Subscription): UserPlan {
  if (isSubscriptionActive(sub.status)) {
    return resolvePlanFromSubscription(sub) ?? "free"
  }
  if (sub.status === "past_due") {
    return resolvePlanFromSubscription(sub) ?? "free"
  }
  return "free"
}

export async function POST(request: NextRequest) {
  const { event, error } = await stripeEvent(request)

  if (!event || error) {
    return NextResponse.json({ error: error ?? "Invalid webhook" }, { status: 400 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkId = session.metadata?.clerk_id ?? session.client_reference_id ?? ""
      const metaPlan = planFromSubscriptionMetadata(session.metadata)
      const plan = metaPlan ?? undefined

      const customerRaw = session.customer
      const customer =
        typeof customerRaw === "string"
          ? customerRaw
          : customerRaw && typeof customerRaw === "object" && "id" in customerRaw
            ? String(customerRaw.id)
            : null
      const subscription = session.subscription as string | null | undefined
      const isOneTime = session.mode === "payment"

      if (clerkId && plan) {
        const { error: updateErr } = await supabase
          .from("users")
          .update({
            ...(customer ? { stripe_customer_id: customer } : {}),
            stripe_subscription_id: isOneTime ? null : (subscription ?? null),
            plan,
          })
          .eq("clerk_id", clerkId)

        if (updateErr) {
          console.error("[stripe webhook] checkout.session.completed update failed:", updateErr)
        }
      } else {
        console.warn("[stripe webhook] checkout.session.completed missing metadata", {
          clerkId: Boolean(clerkId),
          plan,
        })
      }
    } else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription
      const clerkId = sub.metadata?.clerk_id

      if (clerkId) {
        const activePlan = subscriptionPlanForStatus(sub)
        await supabase
          .from("users")
          .update({
            stripe_subscription_id: sub.id,
            plan: activePlan,
          })
          .eq("clerk_id", clerkId)
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription
      const clerkId = sub.metadata?.clerk_id

      if (clerkId) {
        await supabase
          .from("users")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("clerk_id", clerkId)
      }
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice
      const subId = subscriptionIdFromInvoice(invoice)
      if (!subId) {
        return NextResponse.json({ received: true })
      }

      const stripe = getStripe()
      const sub = await stripe.subscriptions.retrieve(subId)
      const clerkId = sub.metadata?.clerk_id
      if (!clerkId) {
        return NextResponse.json({ received: true })
      }

      const plan =
        sub.status === "unpaid" || sub.status === "canceled"
          ? "free"
          : subscriptionPlanForStatus(sub)

      await supabase
        .from("users")
        .update({
          stripe_subscription_id: sub.status === "canceled" ? null : sub.id,
          plan,
        })
        .eq("clerk_id", clerkId)
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
