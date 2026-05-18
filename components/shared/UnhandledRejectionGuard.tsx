"use client"

import * as React from "react"
import { normalizeError } from "@/lib/normalize-error"

/**
 * Prevents Next devtools from surfacing raw `Event` objects when a webpack chunk fails to load.
 */
export function UnhandledRejectionGuard() {
  React.useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const isOpaqueEvent =
        (reason && typeof reason === "object" && "type" in reason && !(reason instanceof Error)) ||
        (reason instanceof Error &&
          (reason.message === "[object Event]" || reason.message === "[object Object]"))

      if (!isOpaqueEvent) return

      event.preventDefault()
      const err = normalizeError(reason)
      console.error("[unhandledrejection]", err)
    }

    window.addEventListener("unhandledrejection", onRejection)
    return () => window.removeEventListener("unhandledrejection", onRejection)
  }, [])

  return null
}
