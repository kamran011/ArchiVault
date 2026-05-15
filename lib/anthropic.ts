import 'server-only'

import Anthropic from '@anthropic-ai/sdk'

/** Try in order until one succeeds (404 = try next). */
export const ANTHROPIC_MODEL_FALLBACK_CHAIN = [
  'claude-sonnet-4-6',
  'claude-4-sonnet-20250514',
  'claude-3-5-sonnet-20241022',
] as const

export const ANTHROPIC_DEFAULT_MODEL = ANTHROPIC_MODEL_FALLBACK_CHAIN[0]

export const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || ANTHROPIC_DEFAULT_MODEL

/** Phase-1 core; defaults to ANTHROPIC_MODEL unless ANTHROPIC_CORE_MODEL is set. */
export const ANTHROPIC_CORE_MODEL =
  process.env.ANTHROPIC_CORE_MODEL?.trim() || ANTHROPIC_DEFAULT_MODEL

/** Max output tokens for phase-1 core architecture generation. */
export const ANTHROPIC_CORE_MAX_OUTPUT_TOKENS = (() => {
  const parsed = Number(process.env.ANTHROPIC_CORE_MAX_OUTPUT_TOKENS)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10_000
})()

/** Max output tokens for lazy tech stack generation. */
export const ANTHROPIC_TECH_STACK_MAX_OUTPUT_TOKENS = (() => {
  const parsed = Number(process.env.ANTHROPIC_TECH_STACK_MAX_OUTPUT_TOKENS)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8_000
})()

/** Max output tokens for lazy system design generation. */
export const ANTHROPIC_SYSTEM_DESIGN_MAX_OUTPUT_TOKENS = (() => {
  const parsed = Number(process.env.ANTHROPIC_SYSTEM_DESIGN_MAX_OUTPUT_TOKENS)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5_000
})()

/** @deprecated Use ANTHROPIC_CORE_MAX_OUTPUT_TOKENS or ANTHROPIC_TECH_STACK_MAX_OUTPUT_TOKENS */
export const ANTHROPIC_MAX_OUTPUT_TOKENS = ANTHROPIC_CORE_MAX_OUTPUT_TOKENS

export type AnthropicSystemPrompt = Anthropic.Messages.MessageCreateParams['system']

/** Ephemeral prompt cache — faster repeat calls within ~5 minutes. */
export function cachedSystemPrompt(text: string): AnthropicSystemPrompt {
  return [
    {
      type: 'text',
      text,
      cache_control: { type: 'ephemeral' },
    },
  ]
}

function uniqueModelIds(primary: string, chain: readonly string[]): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const id of [primary, ...chain]) {
    const trimmed = id.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    ordered.push(trimmed)
  }
  return ordered
}

let singleton: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY?.trim()
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  if (!singleton) {
    singleton = new Anthropic({ apiKey: key })
  }
  return singleton
}

function isAnthropicModelNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as { status?: number; error?: { type?: string } }
  if (err.status === 404) return true
  if (err.error?.type === 'not_found_error') return true
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('not_found_error') || message.includes('model:')
}

/** Uses streaming so large max_tokens requests are allowed (> ~21k non-streaming cap). */
export async function createAnthropicTextMessage({
  system,
  userPrompt,
  maxTokens,
  model = ANTHROPIC_MODEL,
  modelFallbackChain = ANTHROPIC_MODEL_FALLBACK_CHAIN,
}: {
  system: AnthropicSystemPrompt
  userPrompt: string
  maxTokens: number
  model?: string
  /** Additional ids to try after `model` on 404. */
  modelFallbackChain?: readonly string[]
}): Promise<{ text: string; stopReason: string | null; modelUsed: string }> {
  const anthropic = getAnthropicClient()
  const candidates = uniqueModelIds(model, modelFallbackChain)

  async function run(requestedModel: string) {
    const stream = anthropic.messages.stream({
      model: requestedModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const message = await stream.finalMessage()
    const block = message.content[0]
    if (block?.type !== 'text') {
      throw new Error('Unexpected AI response')
    }
    return {
      text: block.text,
      stopReason: message.stop_reason,
      modelUsed: requestedModel,
    }
  }

  let lastError: unknown
  for (let i = 0; i < candidates.length; i++) {
    const requestedModel = candidates[i]
    try {
      return await run(requestedModel)
    } catch (error) {
      lastError = error
      const next = candidates[i + 1]
      if (isAnthropicModelNotFound(error) && next) {
        console.warn(
          `[anthropic] Model "${requestedModel}" not found; trying "${next}"`,
        )
        continue
      }
      throw error
    }
  }

  throw lastError ?? new Error('No Anthropic model candidates configured')
}

/** Stream text deltas to the client; returns full text when the message completes. */
export async function streamAnthropicTextMessage({
  system,
  userPrompt,
  maxTokens,
  model = ANTHROPIC_MODEL,
  modelFallbackChain = ANTHROPIC_MODEL_FALLBACK_CHAIN,
  onTextDelta,
}: {
  system: AnthropicSystemPrompt
  userPrompt: string
  maxTokens: number
  model?: string
  modelFallbackChain?: readonly string[]
  onTextDelta: (text: string) => void
}): Promise<{ text: string; stopReason: string | null; modelUsed: string }> {
  const anthropic = getAnthropicClient()
  const candidates = uniqueModelIds(model, modelFallbackChain)

  async function run(requestedModel: string) {
    const stream = anthropic.messages.stream({
      model: requestedModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    })

    let fullText = ''
    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const delta = event.delta.text
        fullText += delta
        onTextDelta(delta)
      }
    }

    const message = await stream.finalMessage()
    const block = message.content[0]
    if (block?.type !== 'text') {
      throw new Error('Unexpected AI response')
    }

    return {
      text: block.text || fullText,
      stopReason: message.stop_reason,
      modelUsed: requestedModel,
    }
  }

  let lastError: unknown
  for (let i = 0; i < candidates.length; i++) {
    const requestedModel = candidates[i]
    try {
      return await run(requestedModel)
    } catch (error) {
      lastError = error
      const next = candidates[i + 1]
      if (isAnthropicModelNotFound(error) && next) {
        console.warn(
          `[anthropic] Model "${requestedModel}" not found; trying "${next}"`,
        )
        continue
      }
      throw error
    }
  }

  throw lastError ?? new Error('No Anthropic model candidates configured')
}
