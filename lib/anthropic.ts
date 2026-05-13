import 'server-only'

import Anthropic from '@anthropic-ai/sdk'

let singleton: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY?.trim()
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }
  if (!singleton) {
    singleton = new Anthropic({ apiKey: key })
  }
  return singleton
}
