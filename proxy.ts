import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { CLERK_ROOT_DOMAIN, isClerkFrontendProxyEnabled } from "@/lib/clerk-config"
import { getClerkPublishableKey, getClerkSecretKey } from "@/lib/clerk-env"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/refund(.*)",
  "/contact(.*)",
  "/pricing(.*)",
  "/api/polar/webhook(.*)",
  "/api/clerk/webhook(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/waitlist",
])

/** API routes use `auth()` in handlers; `auth.protect()` in middleware returns 404 for fetch. */
const isApiRoute = createRouteMatcher(["/api(.*)"])

const clerkHandler = clerkMiddleware(
  async (auth, request) => {
    const p = request.nextUrl.pathname
    // Never run auth on Next internals — some `/_next/*` paths still hit middleware in dev/prod.
    if (p.startsWith("/_next/") || p === "/favicon.ico") {
      return NextResponse.next()
    }

    if (!isPublicRoute(request) && !isApiRoute(request)) {
      await auth.protect()
    }
  },
  {
    secretKey: getClerkSecretKey(),
    publishableKey: getClerkPublishableKey(),
    domain: CLERK_ROOT_DOMAIN,
    ...(isClerkFrontendProxyEnabled()
      ? { frontendApiProxy: { enabled: true } }
      : {}),
  },
)

/** www → apex: Clerk production instance only has archivolt.dev (not www satellite on current plan). */
function redirectWwwToApex(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host")?.split(":")[0]
  if (host !== "www.archivolt.dev") return null
  const url = request.nextUrl.clone()
  url.host = "archivolt.dev"
  url.protocol = "https:"
  return NextResponse.redirect(url, 308)
}

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const wwwRedirect = redirectWwwToApex(request)
  if (wwwRedirect) return wwwRedirect
  return clerkHandler(request, event)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
