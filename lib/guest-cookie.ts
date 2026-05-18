import { createHash, randomUUID } from "crypto"

export const GUEST_COOKIE_NAME = "archivolt_guest"
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function newGuestToken(): string {
  return randomUUID()
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null
  return createHash("sha256").update(ip.trim()).digest("hex")
}

export function guestCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${GUEST_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${GUEST_COOKIE_MAX_AGE}${secure}`
}

export function parseGuestToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${GUEST_COOKIE_NAME}=([^;]+)`))
  return match?.[1]?.trim() || null
}
