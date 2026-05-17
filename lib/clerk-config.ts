/**
 * Clerk custom-domain root (apex), NOT the www app host.
 * Clerk loads the Frontend API from `clerk.${CLERK_ROOT_DOMAIN}` (e.g. clerk.archivolt.dev).
 * Setting this to `www.archivolt.dev` breaks with ERR_NAME_NOT_RESOLVED (clerk.www.archivolt.dev).
 */
export const CLERK_ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim() || "archivolt.dev"

/** Optional: load Clerk JS via your app origin (see Clerk "Proxying the Frontend API"). */
export function getClerkProxyUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  // Production app runs on www; proxy must match the browser host for handshake after external redirects (e.g. Polar).
  if (process.env.NODE_ENV === "production") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
    if (appUrl && !appUrl.includes("localhost")) {
      return `${appUrl.replace(/\/$/, "")}/__clerk`
    }
  }
  return undefined
}

export function clerkProviderAuthProps(): { domain: string } | { proxyUrl: string } {
  const proxyUrl = getClerkProxyUrl()
  if (proxyUrl) return { proxyUrl }
  return { domain: CLERK_ROOT_DOMAIN }
}
