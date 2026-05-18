import { architectureCoreSchema } from "@/lib/architecture-schema"
import {
  createAnthropicTextMessage,
  streamAnthropicTextMessage,
  ANTHROPIC_CORE_MAX_OUTPUT_TOKENS,
  ANTHROPIC_MODEL_FALLBACK_CHAIN,
  cachedSystemPrompt,
} from "@/lib/anthropic"
import { rationaleToExplanation, parseLegacyFutureProofExplanation } from "@/lib/future-proof-rationale"
import { getGroqClient, groqMaxOutputTokens } from "@/lib/groq"
import { VBD_SYSTEM_PROMPT_GROQ_CORE, VBD_SYSTEM_PROMPT_CORE } from "@/lib/vbd-prompt"
import { parseModelJson } from "@/lib/parse-model-json"
import { sanitizeMermaidDiagram } from "@/lib/sanitize-mermaid"
import type { Architecture } from "@/types/architecture"
import { z } from "zod"

export const ARCHITECTURE_PHASE_MODEL = "claude-sonnet-4-6"
export const DESCRIPTION_AI_MAX = 3000

export const architectureBodySchema = z.object({
  description: z.string().min(10).max(20000),
  techStack: z.string().optional(),
  scale: z.string().optional(),
  industry: z.string().optional(),
})

export function encodeSse(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`)
}

export function buildUserPrompt(
  description: string,
  techStack?: string,
  scale?: string,
  industry?: string,
) {
  return `
    System Description: ${description}
    Tech Stack Preference: ${techStack || "Any"}
    Expected Scale: ${scale || "Startup (0–10k users)"}
    Industry: ${industry || "General"}

    Apply USER CONTEXT RULES from the system prompt for this tech stack, scale, and industry.
    Analyze this system using Volatility-Based Decomposition and return the architecture core JSON matching the schema. Do not return anything outside the JSON object.
  `
}

export function buildArchitectureFromModelText(rawText: string, finishReason: string | null): Architecture {
  let parsedJson: unknown

  try {
    parsedJson = parseModelJson(rawText)
  } catch {
    if (finishReason === "length") {
      throw new Error("generation_cut_off")
    }
    throw new Error("invalid_json")
  }

  const validated = architectureCoreSchema.safeParse(coerceFutureProofFields(parsedJson))

  if (!validated.success) {
    throw new Error("Generation failed — please try again.")
  }

  return {
    ...validated.data,
    mermaidDiagram: sanitizeMermaidDiagram(validated.data.mermaidDiagram),
    futureProofExplanation:
      validated.data.futureProofExplanation ??
      rationaleToExplanation(validated.data.futureProofRationale),
  }
}

export async function callArchitectureModel({
  groqKey,
  userPrompt,
  groqMaxTokens,
  anthropicMaxTokens,
}: {
  groqKey?: string
  userPrompt: string
  groqMaxTokens: number
  anthropicMaxTokens: number
}): Promise<{ text: string; finishReason: string | null }> {
  if (groqKey) {
    const groq = getGroqClient()
    const model = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile"
    const completion = await groq.chat.completions.create({
      model,
      max_tokens: groqMaxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: VBD_SYSTEM_PROMPT_GROQ_CORE },
        { role: "user", content: userPrompt },
      ],
    })
    const content = completion.choices[0]?.message?.content
    if (typeof content !== "string") {
      throw new Error("Unexpected AI response")
    }
    return {
      text: content,
      finishReason: completion.choices[0]?.finish_reason ?? null,
    }
  }

  const { text, stopReason } = await createAnthropicTextMessage({
    system: cachedSystemPrompt(VBD_SYSTEM_PROMPT_CORE),
    userPrompt,
    maxTokens: anthropicMaxTokens,
    model: ARCHITECTURE_PHASE_MODEL,
    modelFallbackChain: ANTHROPIC_MODEL_FALLBACK_CHAIN,
  })
  return {
    text,
    finishReason: stopReason === "max_tokens" ? "length" : stopReason,
  }
}

export function formatAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)

  if (raw.includes("rate_limit_exceeded") || raw.includes("Rate limit")) {
    if (raw.includes("Request too large") || raw.includes("tokens per minute")) {
      return "Request too large for the AI provider — try a shorter description or wait a minute and retry."
    }
    return "AI rate limit reached — wait a minute and try again."
  }

  if (raw.includes("413") || raw.includes("too large")) {
    return "Request too large for the AI provider — try a shorter system description."
  }

  if (raw.includes("not_found_error") || raw.includes('"type":"not_found_error"')) {
    return `AI model unavailable — tried: ${[ARCHITECTURE_PHASE_MODEL, ...ANTHROPIC_MODEL_FALLBACK_CHAIN].join(", ")}.`
  }

  if (raw.includes("authentication_error") || raw.includes("invalid x-api-key")) {
    return "Invalid Anthropic API key — check ANTHROPIC_API_KEY in .env.local."
  }

  if (raw === "generation_cut_off") {
    return "Generation was cut off — try a shorter system description and retry."
  }

  if (raw === "invalid_json" || raw === "validation_failed") {
    return "The model returned invalid JSON. Please try again."
  }

  return "AI service unavailable. Try again shortly."
}

function coerceFutureProofFields(data: unknown): unknown {
  if (!data || typeof data !== "object") return data

  const obj = data as Record<string, unknown>
  if (obj.futureProofRationale && typeof obj.futureProofRationale === "object") {
    return data
  }

  if (typeof obj.futureProofExplanation === "string") {
    const score = typeof obj.futureProofScore === "number" ? obj.futureProofScore : 70
    const rationale = parseLegacyFutureProofExplanation(obj.futureProofExplanation, score)
    if (rationale) {
      return { ...obj, futureProofRationale: rationale }
    }
  }

  return data
}

export { streamAnthropicTextMessage, cachedSystemPrompt, VBD_SYSTEM_PROMPT_CORE, ANTHROPIC_CORE_MAX_OUTPUT_TOKENS }
