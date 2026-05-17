/**
 * Clerk custom-domain root (apex), NOT the www app host.
 * Clerk loads the Frontend API from `clerk.${CLERK_ROOT_DOMAIN}` (e.g. clerk.archivolt.dev).
 * Setting this to `www.archivolt.dev` breaks with ERR_NAME_NOT_RESOLVED (clerk.www.archivolt.dev).
 */
export const CLERK_ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim() || "archivolt.dev"

/**
 * Optional Frontend API proxy (https://www.archivolt.dev/__clerk).
 * Only enable when explicitly configured in env AND in Clerk Dashboard → Domains (proxy).
 * Auto-enabling proxy without Dashboard setup causes host_invalid / 400 on /__clerk/v1/client.
 */
export function getClerkProxyUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim()
  if (!explicit) return undefined
  return explicit.replace(/\/$/, "")
}

export function isClerkFrontendProxyEnabled(): boolean {
  return Boolean(getClerkProxyUrl())
}

export function clerkProviderAuthProps(): { domain: string } | { proxyUrl: string } {
  const proxyUrl = getClerkProxyUrl()
  if (proxyUrl) return { proxyUrl }
  return { domain: CLERK_ROOT_DOMAIN }
}
