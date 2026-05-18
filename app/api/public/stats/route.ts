import { NextResponse } from "next/server"
import { countExternalClerkUsers } from "@/lib/clerk-member-count"

export const revalidate = 120

export async function GET() {
  const visitorCount = Number.parseInt(process.env.NEXT_PUBLIC_SOCIAL_PROOF_VISITORS ?? "14", 10) || 14

  let memberCount = 0
  try {
    memberCount = await countExternalClerkUsers()
  } catch (e) {
    console.error("[public/stats]", e)
  }

  const payload = {
    memberCount,
    visitorCount,
    headline:
      memberCount >= 1
        ? `Join ${memberCount}+ architects using Archivolt`
        : `${visitorCount} architects exploring Archivolt`,
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  })
}
