import "server-only"

import { Polar } from "@polar-sh/sdk"

export type PolarServer = "sandbox" | "production"

/** Local `next dev` uses dev Polar config; production builds use prod config. */
export function isPolarDevRuntime(): boolean {
  return process.env.NODE_ENV !== "production"
}

function parsePolarServer(value: string | undefined): PolarServer {
  const env = value?.trim().toLowerCase()
  return env === "sandbox" ? "sandbox" : "production"
}

export function getPolarServer(): PolarServer {
  if (isPolarDevRuntime()) {
    return parsePolarServer(
      process.env.POLAR_SERVER_DEV ?? process.env.POLAR_SERVER,
    )
  }
  return parsePolarServer(
    process.env.POLAR_SERVER_PROD ?? process.env.POLAR_SERVER,
  )
}

export function getPolarAccessToken(): string | undefined {
  if (isPolarDevRuntime()) {
    return (
      process.env.POLAR_ACCESS_TOKEN_DEV?.trim() ||
      process.env.POLAR_ACCESS_TOKEN?.trim()
    )
  }
  return (
    process.env.POLAR_ACCESS_TOKEN_PROD?.trim() ||
    process.env.POLAR_ACCESS_TOKEN?.trim()
  )
}

export function getPolarWebhookSecret(): string | undefined {
  if (isPolarDevRuntime()) {
    const secret =
      process.env.POLAR_WEBHOOK_SECRET_DEV?.trim() ||
      process.env.POLAR_WEBHOOK_SECRET?.trim()
    if (!secret && process.env.NODE_ENV === "development") {
      console.warn(
        "[polar] POLAR_WEBHOOK_SECRET_DEV is missing — webhooks will fail and plans will not sync after checkout.",
      )
    }
    return secret
  }
  return (
    process.env.POLAR_WEBHOOK_SECRET_PROD?.trim() ||
    process.env.POLAR_WEBHOOK_SECRET?.trim()
  )
}

export function createPolarClient(): Polar {
  const accessToken = getPolarAccessToken()
  if (!accessToken) {
    const hint = isPolarDevRuntime()
      ? "POLAR_ACCESS_TOKEN_DEV"
      : "POLAR_ACCESS_TOKEN_PROD"
    throw new Error(`${hint} is not configured`)
  }
  return new Polar({
    accessToken,
    server: getPolarServer(),
  })
}

export class PolarApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = "PolarApiError"
  }
}
