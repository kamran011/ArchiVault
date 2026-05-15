import "server-only"

import Groq from "groq-sdk"

let singleton: Groq | null = null

/** llama-3.3-70b-versatile on-demand TPM — input + max_tokens must not exceed this. */
export const GROQ_TPM_LIMIT = 12_000

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5)
}

/** Max completion tokens that fit Groq TPM budget for a given prompt pair. */
export function groqMaxOutputTokens(systemPrompt: string, userPrompt: string): number {
  const limit = Number(process.env.GROQ_TPM_LIMIT) || GROQ_TPM_LIMIT
  const input = estimateTokens(systemPrompt + userPrompt)
  const headroom = 250
  return Math.max(3000, Math.min(8000, limit - input - headroom))
}

export function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY?.trim()
  if (!key) {
    throw new Error("GROQ_API_KEY is not set")
  }
  if (!singleton) {
    singleton = new Groq({ apiKey: key })
  }
  return singleton
}
