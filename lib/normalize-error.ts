const CHUNK_LOAD_HINT =
  "A page script failed to load. Hard-refresh (Ctrl+Shift+R) or restart dev with: npm run dev:clean"

/** Turn webpack chunk `Event` rejections and other non-Error values into real Errors. */
export function normalizeError(reason: unknown, fallback = "Something went wrong"): Error {
  if (reason instanceof Error) {
    if (reason.message === "[object Event]" || reason.message === "[object Object]") {
      return new Error(CHUNK_LOAD_HINT)
    }
    return reason
  }

  if (typeof reason === "string") {
    if (reason === "[object Event]") return new Error(CHUNK_LOAD_HINT)
    return new Error(reason)
  }

  if (reason && typeof reason === "object") {
    const maybeEvent = reason as Event
    if (typeof maybeEvent.type === "string") {
      return new Error(CHUNK_LOAD_HINT)
    }
  }

  return new Error(fallback)
}

export function errorMessage(reason: unknown, fallback = "Something went wrong"): string {
  return normalizeError(reason, fallback).message
}
