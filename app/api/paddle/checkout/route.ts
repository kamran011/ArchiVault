import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { paddleFetch, PaddleApiError } from "@/lib/paddle"
import type { CheckoutPlan } from "@/lib/plans"

const checkoutSchema = z.object({ plan: z.enum(["blueprint", "pro", "team"]) })

function resolveAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

function priceIdForPlan(plan: CheckoutPlan): string | undefined {
  if (plan === "blueprint") return process.env.PADDLE_BLUEPRINT_PRICE_ID?.trim()
  if (plan === "pro") return process.env.PADDLE_PRO_PRICE_ID?.trim()
  return process.env.PADDLE_TEAM_PRICE_ID?.trim()
}

type PaddleTransactionResponse = {
  data?: {
    checkout?: { url?: string }
  }
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
  const priceId = priceIdForPlan(plan)

  if (!priceId) {
    console.error(`Missing Paddle price id for ${plan}`)
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  const appUrl = resolveAppUrl()

  try {
    const body: Record<string, unknown> = {
      items: [{ price_id: priceId, quantity: 1 }],
      custom_data: { clerk_id: userId, plan },
      collection_mode: "automatic",
      checkout: {
        url: `${appUrl}/dashboard?checkout=success`,
      },
    }

    if (email) {
      body.customer = { email }
    }

    const result = await paddleFetch<PaddleTransactionResponse>("/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    })

    const url = result.data?.checkout?.url
    if (!url) {
      return NextResponse.json({ error: "Paddle checkout URL could not be created" }, { status: 502 })
    }

    return NextResponse.json({ url })
  } catch (e) {
    console.error(e)
    if (e instanceof PaddleApiError) {
      return NextResponse.json({ error: e.message }, { status: 502 })
    }
    return NextResponse.json({ error: "Checkout could not be created" }, { status: 502 })
  }
}
