import { getClerkSecretKey } from "@/lib/clerk-env"

export function parseInternalEmailSet(): Set<string> {
  const raw = process.env.ARCHIVOLT_INTERNAL_EMAILS?.trim()
  if (!raw) return new Set()
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  )
}

type ClerkUserRow = {
  id: string
  email_addresses?: { email_address: string; id: string }[]
  primary_email_address_id?: string | null
}

function primaryEmail(u: ClerkUserRow): string {
  const primaryId = u.primary_email_address_id
  const addr =
    u.email_addresses?.find((e) => e.id === primaryId)?.email_address ??
    u.email_addresses?.[0]?.email_address ??
    ""
  return addr.trim().toLowerCase()
}

/**
 * When ARCHIVOLT_INTERNAL_EMAILS is set: count users whose primary email is NOT in that list.
 * When unset: returns 0 so marketing copy falls back to "exploring" (visitor) headline.
 */
export async function countExternalClerkUsers(): Promise<number> {
  const secret = getClerkSecretKey()
  if (!secret) return 0

  const internal = parseInternalEmailSet()
  let offset = 0
  const limit = 100
  let external = 0

  for (;;) {
    const res = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-created_at`,
      { headers: { Authorization: `Bearer ${secret}` } },
    )
    if (!res.ok) {
      console.error("[stats] Clerk list users failed", res.status)
      return 0
    }
    const body = (await res.json()) as { data?: ClerkUserRow[] }
    const list = body.data ?? []
    if (list.length === 0) break

    for (const u of list) {
      if (internal.size === 0) continue
      const lower = primaryEmail(u)
      if (!internal.has(lower)) external += 1
    }

    if (list.length < limit) break
    offset += limit
  }

  return external
}
