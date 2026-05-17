import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { CLERK_ROOT_DOMAIN } from "@/lib/clerk-config"
import { getClerkPublishableKey } from "@/lib/clerk-env"

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

const isProduction = process.env.NODE_ENV === "production"
const clerkPublishableKey = getClerkPublishableKey()

/** Clerk proxy only for production live keys (custom domain). Avoids host_invalid on local `next start`. */
const useClerkFrontendProxy =
  isProduction && clerkPublishableKey.startsWith("pk_live")

export default clerkMiddleware(
  async (auth, request) => {
    const host = request.headers.get("host")?.split(":")[0]
    if (host === "archivolt.dev") {
      const url = request.nextUrl.clone()
      url.host = "www.archivolt.dev"
      url.protocol = "https:"
      return NextResponse.redirect(url, 308)
    }

    const p = request.nextUrl.pathname
    // Never run auth on Next internals — some `/_next/*` paths still hit middleware in dev/prod.
    // Calling `auth.protect()` there can rewrite/404 chunks → HTML loads with zero CSS (broken UI).
    if (p.startsWith("/_next/") || p === "/favicon.ico") {
      return NextResponse.next()
    }

    if (!isPublicRoute(request) && !isApiRoute(request)) {
      await auth.protect()
    }
  },
  {
    domain: CLERK_ROOT_DOMAIN,
    frontendApiProxy: { enabled: useClerkFrontendProxy },
  },
)

export const config = {
  matcher: [
    // Skip all of `/_next/*` (static, webpack-hmr, turbopack, etc.), static files, and file-like URLs.
    // Narrow `(?!_next/static|…)` misses dev-only paths and breaks JS/CSS with 404.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
