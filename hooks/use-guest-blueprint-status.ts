"use client"

import * as React from "react"
import { useAuth } from "@clerk/nextjs"

export function useGuestBlueprintStatus() {
  const { isLoaded, isSignedIn } = useAuth()
  const [hasUsedGuest, setHasUsedGuest] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      setReady(true)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const res = await fetch("/api/guest/status", { credentials: "include" })
        const body = (await res.json()) as { hasUsedGuestBlueprint?: boolean }
        if (!cancelled && res.ok) {
          setHasUsedGuest(Boolean(body.hasUsedGuestBlueprint))
        }
      } catch {
        // default: show Try as guest
      } finally {
        if (!cancelled) setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  return { isLoaded, isSignedIn, hasUsedGuest, ready }
}
