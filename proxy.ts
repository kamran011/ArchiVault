import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/stripe/webhook(.*)",
  "/api/webhooks/clerk(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  const p = request.nextUrl.pathname
  // Next may still invoke this middleware for `/_next/static/*` despite matcher tweaks.
  // If we call `auth.protect()` there, Clerk rewrites the request and CSS/JS returns 404 → unstyled app.
  if (p.startsWith("/_next/static") || p.startsWith("/_next/image") || p === "/favicon.ico") {
    return NextResponse.next()
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip static assets and the image optimizer. The broad Clerk/Next `(?!_next|…|\\.css)` matcher
    // can still hit some `/_next/*` requests and break production CSS/JS (HTML loads, assets 404).
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
