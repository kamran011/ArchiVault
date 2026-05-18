"use client"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

/** Vercel analytics scripts 500 in local dev when the webpack cache is stale; load only in production. */
export function ClientVercelInsights() {
  if (process.env.NODE_ENV !== "production") {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
