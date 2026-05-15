import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripe } from "@/lib/stripe"
import type { CheckoutPlan } from "@/lib/plans"

const checkoutSchema = z.object({ plan: z.enum(["blueprint", "pro", "team"]) })

function resolveAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

function priceIdForPlan(plan: CheckoutPlan): string | undefined {
  if (plan === "blueprint") return process.env.STRIPE_BLUEPRINT_PRICE_ID
  if (plan === "pro") return process.env.STRIPE_PRO_PRICE_ID
  return process.env.STRIPE_TEAM_PRICE_ID
}

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => ({})))

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan", details: parsed.error.flatten() }, { status: 400 })
  }

  const { plan } = parsed.data
  const priceEnv = priceIdForPlan(plan)

  if (!priceEnv) {
    console.error(`Missing Stripe price id for ${plan}`)
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  const stripe = getStripe()
  const isOneTime = plan === "blueprint"

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      line_items: [{ price: priceEnv, quantity: 1 }],
      success_url: `${resolveAppUrl()}/dashboard?checkout=success`,
      cancel_url: `${resolveAppUrl()}/?checkout=canceled#pricing`,
      client_reference_id: userId,
      customer_email: email ?? undefined,
      metadata: { clerk_id: userId, plan },
      ...(isOneTime
        ? {}
        : {
            subscription_data: {
              metadata: { clerk_id: userId, plan },
            },
          }),
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Stripe session could not be created" }, { status: 502 })
  }
}
