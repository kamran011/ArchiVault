import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createPolarClient } from "@/lib/polar"

function resolveAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")
}

/** Opens Polar customer portal (payment method, invoices, subscription). */
export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const polar = createPolarClient()
    const session = await polar.customerSessions.create({
      externalCustomerId: userId,
      returnUrl: `${resolveAppUrl()}/settings/billing`,
    })

    if (!session.customerPortalUrl) {
      return NextResponse.json({ error: "Portal URL unavailable" }, { status: 502 })
    }

    return NextResponse.json({ url: session.customerPortalUrl })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : "Could not open billing portal"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
