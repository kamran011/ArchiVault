import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { formatPolarCheckoutError } from "@/lib/polar-checkout-error"
import { createPolarClient } from "@/lib/polar"
import { productIdForPlan } from "@/lib/polar-plans"
import type { CheckoutPlan } from "@/lib/plans"

const checkoutPlans = ["blueprint", "pro", "team", "test"] as const
const checkoutSchema = z.object({ plan: z.enum(checkoutPlans) })

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

  const { plan } = parsed.data

  if (plan === "test" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test checkout is disabled in production" }, { status: 403 })
  }

  const productId = productIdForPlan(plan as CheckoutPlan)

  if (!productId) {
    console.error(`Missing Polar product id for ${plan}`)
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  const appUrl = resolveAppUrl().replace(/\/$/, "")

  try {
    const polar = createPolarClient()
    const checkout = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: userId,
      metadata: { clerk_id: userId, plan },
      ...(email ? { customerEmail: email } : {}),
      successUrl: `${appUrl}/dashboard?checkout=success`,
    })

    if (!checkout.url) {
      return NextResponse.json({ error: "Polar checkout URL could not be created" }, { status: 502 })
    }

    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    console.error("[polar checkout]", plan, productId, e)
    return NextResponse.json(
      { error: formatPolarCheckoutError(e, plan) },
      { status: 502 },
    )
  }
}
