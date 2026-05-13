import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
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
      const plan = session.metadata?.plan as "pro" | "team" | undefined

      const customer = session.customer as string | null | undefined
      const subscription = session.subscription as string | null | undefined

      if (clerkId && plan && customer) {
        await supabase
          .from("users")
          .update({
            stripe_customer_id: customer,
            stripe_subscription_id: subscription ?? null,
            plan,
          })
          .eq("clerk_id", clerkId)
      }
    } else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription
      const clerkId = sub.metadata?.clerk_id
      const metaPlan = sub.metadata?.plan as string | undefined
      const status = sub.status

      if (clerkId) {
        const activePlan =
          metaPlan &&
          (status === "active" || status === "trialing" || status === "past_due")
            ? metaPlan
            : "free"
        await supabase
          .from("users")
          .update({
            stripe_subscription_id: sub.id,
            plan: activePlan ?? "free",
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
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
