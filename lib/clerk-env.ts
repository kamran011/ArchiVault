/**
 * Resolve Clerk keys for the current runtime.
 * Vercel Production: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY (pk_live / sk_live).
 * *_PROD fallbacks support local scripts and misnamed env copies.
 */
function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  )
}

export function getClerkPublishableKey(): string {
  if (isProductionRuntime()) {
    return (
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD?.trim() ||
      ""
    )
  }
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || ""
}

export function getClerkSecretKey(): string {
  if (isProductionRuntime()) {
    return (
      process.env.CLERK_SECRET_KEY?.trim() ||
      process.env.CLERK_SECRET_KEY_PROD?.trim() ||
      ""
    )
  }
  return process.env.CLERK_SECRET_KEY?.trim() || ""
}

export function assertClerkKeysConfigured(): void {
  const pk = getClerkPublishableKey()
  const sk = getClerkSecretKey()
  if (pk && sk) return
  const missing = [
    !pk && "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    !sk && "CLERK_SECRET_KEY",
  ].filter(Boolean)
  throw new Error(
    `Clerk: Missing ${missing.join(" and ")}. Add live keys in Vercel → Settings → Environment Variables → Production, then redeploy (build required for NEXT_PUBLIC_*).`,
  )
}
