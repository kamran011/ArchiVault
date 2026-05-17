/**
 * Resolve Clerk keys for the current runtime.
 * Vercel should set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY (live in Production).
 * *_PROD fallbacks support local scripts and misnamed env copies.
 */
export function getClerkPublishableKey(): string {
  if (process.env.NODE_ENV === "production") {
    return (
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD?.trim() ||
      ""
    )
  }
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || ""
}

export function getClerkSecretKey(): string {
  if (process.env.NODE_ENV === "production") {
    return (
      process.env.CLERK_SECRET_KEY?.trim() ||
      process.env.CLERK_SECRET_KEY_PROD?.trim() ||
      ""
    )
  }
  return process.env.CLERK_SECRET_KEY?.trim() || ""
}
