import "server-only"
import crypto from "crypto"

/** Verify Paddle-Signature header (ts=...;h1=...). */
export function verifyPaddleWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader?.trim()) return false

  const parts: Record<string, string> = {}
  for (const segment of signatureHeader.split(";")) {
    const [key, value] = segment.split("=")
    if (key && value) parts[key.trim()] = value.trim()
  }

  const ts = parts.ts
  const h1 = parts.h1
  if (!ts || !h1) return false

  const signedPayload = `${ts}:${rawBody}`
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(h1, "hex"), Buffer.from(expected, "hex"))
  } catch {
    return false
  }
}
