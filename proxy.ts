import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/refund(.*)",
  "/api/stripe/webhook(.*)",
  "/api/clerk/webhook(.*)",
  "/api/webhooks/clerk(.*)",
])

const isProduction = process.env.NODE_ENV === "production"

export default clerkMiddleware(
  async (auth, request) => {
    const p = request.nextUrl.pathname
    // Never run auth on Next internals — some `/_next/*` paths still hit middleware in dev/prod.
    // Calling `auth.protect()` there can rewrite/404 chunks → HTML loads with zero CSS (broken UI).
    if (p.startsWith("/_next/") || p === "/favicon.ico") {
      return NextResponse.next()
    }

    if (!isPublicRoute(request)) {
      await auth.protect()
    }
  },
  // Production custom domains (e.g. archivolt.dev) need this; on localhost it can interfere with dev chunks.
  { frontendApiProxy: { enabled: isProduction } },
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
