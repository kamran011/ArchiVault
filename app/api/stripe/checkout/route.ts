import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripe } from "@/lib/stripe"

const checkoutSchema = z.object({ plan: z.enum(["pro", "team"]) })

function resolveAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
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

  const priceEnv = parsed.data.plan === "pro" ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_TEAM_PRICE_ID

  if (!priceEnv) {
    console.error(`Missing Stripe price id for ${parsed.data.plan}`)
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  const stripe = getStripe()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceEnv, quantity: 1 }],
      success_url: `${resolveAppUrl()}/dashboard?checkout=success`,
      cancel_url: `${resolveAppUrl()}/?checkout=canceled`,
      client_reference_id: userId,
      customer_email: email ?? undefined,
      metadata: { clerk_id: userId, plan: parsed.data.plan },
      subscription_data: {
        metadata: { clerk_id: userId, plan: parsed.data.plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Stripe session could not be created" }, { status: 502 })
  }
}
