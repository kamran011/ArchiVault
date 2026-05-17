import "server-only"

export function getPaddleApiBase(): string {
  const env = process.env.PADDLE_ENVIRONMENT?.trim().toLowerCase()
  if (env === "sandbox") return "https://sandbox-api.paddle.com"
  return "https://api.paddle.com"
}

export class PaddleApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = "PaddleApiError"
  }
}

export async function paddleFetch<T = unknown>(
  path: string,
  options: RequestInit & { method?: string } = {},
): Promise<T> {
  const key = process.env.PADDLE_API_KEY?.trim()
  if (!key) throw new Error("Missing PADDLE_API_KEY")

  const url = `${getPaddleApiBase()}${path.startsWith("/") ? path : `/${path}`}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const errObj = data as { error?: { detail?: string; message?: string } } | null
    const detail =
      errObj?.error?.detail ?? errObj?.error?.message ?? `Paddle API error ${res.status}`
    throw new PaddleApiError(detail, res.status, data)
  }

  return data as T
}
