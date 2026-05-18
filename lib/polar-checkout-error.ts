/** User-facing message from Polar checkout / SDK failures. */
export function formatPolarCheckoutError(error: unknown, plan?: string): string {
  const raw = error instanceof Error ? error.message : String(error)

  if (/product is archived/i.test(raw)) {
    const planLabel = plan ? ` (${plan})` : ""
    return `That plan${planLabel} is archived in Polar and cannot be purchased. Create or unarchive the product in Polar, then update POLAR_*_PRODUCT_ID on Vercel.`
  }

  if (/missing polar product id/i.test(raw) || /checkout is not configured/i.test(raw)) {
    return "Checkout is not configured for this plan. Contact support."
  }

  const detailMatch = raw.match(/"msg":"([^"]+)"/)
  if (detailMatch?.[1]) return detailMatch[1]

  if (raw.length > 200) return "Checkout could not be started. Please try again or contact support."
  return raw || "Checkout could not be started"
}
