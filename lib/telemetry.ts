"use client"

import { track } from "@vercel/analytics"

export function telemetry(
  name: string,
  props?: Record<string, string | number | boolean | undefined>,
): void {
  try {
    const clean = props
      ? Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Record<
          string,
          string | number | boolean
        >
      : undefined
    track(name, clean)
  } catch {
    // no-op (e.g. SSR or analytics blocked)
  }
}
