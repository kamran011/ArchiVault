import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { architectureCoreSchema } from "@/lib/architecture-schema"
import {
  createAnthropicTextMessage,
  streamAnthropicTextMessage,
  ANTHROPIC_CORE_MAX_OUTPUT_TOKENS,
  ANTHROPIC_MODEL_FALLBACK_CHAIN,
  cachedSystemPrompt,
} from "@/lib/anthropic"

const ARCHITECTURE_PHASE_MODEL = "claude-sonnet-4-6"
import { rationaleToExplanation, parseLegacyFutureProofExplanation } from "@/lib/future-proof-rationale"
import { getGroqClient, groqMaxOutputTokens } from "@/lib/groq"
import { getServiceRoleClient } from "@/lib/supabase"
import { VBD_SYSTEM_PROMPT_GROQ_CORE, VBD_SYSTEM_PROMPT_CORE } from "@/lib/vbd-prompt"
import { redactArchitectureForPlan, type UserPlan } from "@/lib/plan-gate"
import { resolveSimulatedPlan, resolveSimulatedGenerationCount } from "@/lib/dev-plan-simulate"
import { isGenerationAllowed, generationLimitMessage } from "@/lib/plans"
import { parseModelJson } from "@/lib/parse-model-json"
import { sanitizeMermaidDiagram } from "@/lib/sanitize-mermaid"
import type { Architecture } from "@/types/architecture"
import { z } from "zod"

const DESCRIPTION_AI_MAX = 3000

const bodySchema = z.object({
  description: z.string().min(10).max(20000),
  techStack: z.string().optional(),
  scale: z.string().optional(),
  industry: z.string().optional(),
})

function encodeSse(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`)
}

function buildUserPrompt(
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

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data: initialUser, error: userErr } = await supabase
    .from("users")
    .select("plan, generation_count")
    .eq("clerk_id", userId)
    .maybeSingle()

  let user = initialUser

  if (userErr) {
    console.error(userErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!user) {
    const { error: insertErr } = await supabase.from("users").insert({ clerk_id: userId })

    if (insertErr?.code !== "23505") {
      console.error(insertErr)
    }

    const refetch = await supabase
      .from("users")
      .select("plan, generation_count")
      .eq("clerk_id", userId)
      .maybeSingle()

    user = refetch.data ?? null

    if (!user) {
      return NextResponse.json({ error: "Could not create user profile" }, { status: 500 })
    }
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count, error: countErr } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("clerk_id", userId)
    .gte("created_at", oneHourAgo)

  if (countErr) {
    console.error(countErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (count !== null && count >= 10) {
    return NextResponse.json(
      { error: "Rate limit reached. Max 10 architecture generations per hour." },
      { status: 429 },
    )
  }

  const plan = resolveSimulatedPlan((user.plan ?? "free") as UserPlan)
  const generationCount = resolveSimulatedGenerationCount(user.generation_count ?? 0)

  if (!isGenerationAllowed(plan, generationCount)) {
    return NextResponse.json({ error: generationLimitMessage(plan) }, { status: 403 })
  }

  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsedBody = bodySchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedBody.error.flatten() }, { status: 400 })
  }

  const { description: rawDescription, techStack, scale, industry } = parsedBody.data
  const descriptionForAi = rawDescription.slice(0, DESCRIPTION_AI_MAX)
  const userPrompt = buildUserPrompt(descriptionForAi, techStack, scale, industry)

  const groqKey = process.env.GROQ_API_KEY?.trim()
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()

  if (!groqKey && !anthropicKey) {
    return NextResponse.json(
      { error: "AI not configured. Set GROQ_API_KEY (Groq) or ANTHROPIC_API_KEY (Claude)." },
      { status: 503 },
    )
  }

  const groqMaxTokens = groqKey
    ? groqMaxOutputTokens(VBD_SYSTEM_PROMPT_GROQ_CORE, userPrompt)
    : 12000
  const anthropicMaxTokens = ANTHROPIC_CORE_MAX_OUTPUT_TOKENS

  const readable = new ReadableStream({
    async start(controller) {
      const enqueue = (payload: Record<string, unknown>) => {
        controller.enqueue(encodeSse(payload))
      }

      const sendError = (message: string) => {
        enqueue({ error: message })
        controller.close()
      }

      try {
        let rawText: string
        let finishReason: string | null = null

        if (groqKey) {
          const result = await callArchitectureModel({
            groqKey,
            userPrompt,
            groqMaxTokens,
            anthropicMaxTokens,
          })
          rawText = result.text
          finishReason = result.finishReason
          const chunkSize = 400
          for (let i = 0; i < rawText.length; i += chunkSize) {
            enqueue({ chunk: rawText.slice(i, i + chunkSize) })
          }
        } else {
          const result = await streamAnthropicTextMessage({
            system: cachedSystemPrompt(VBD_SYSTEM_PROMPT_CORE),
            userPrompt,
            maxTokens: anthropicMaxTokens,
            model: ARCHITECTURE_PHASE_MODEL,
            modelFallbackChain: ANTHROPIC_MODEL_FALLBACK_CHAIN,
            onTextDelta: (text) => enqueue({ chunk: text }),
          })
          rawText = result.text
          finishReason = result.stopReason === "max_tokens" ? "length" : result.stopReason
        }

        let architecture: Architecture
        try {
          architecture = buildArchitectureFromModelText(rawText, finishReason)
        } catch (parseErr) {
          console.error("JSON parse failed, retrying once:", parseErr)
          try {
            const retry = await callArchitectureModel({
              groqKey,
              userPrompt: `${userPrompt}\n\nYour previous response was not valid JSON. Return ONLY one valid JSON object matching the schema.`,
              groqMaxTokens,
              anthropicMaxTokens,
            })
            architecture = buildArchitectureFromModelText(retry.text, retry.finishReason)
          } catch {
            sendError("The model returned invalid JSON. Please try again.")
            return
          }
        }

        const nextCount = (user.generation_count ?? 0) + 1
        const timestamp = new Date().toISOString()

        const { error: updErr } = await supabase
          .from("users")
          .update({
            generation_count: nextCount,
            last_generation_at: timestamp,
          })
          .eq("clerk_id", userId)

        if (updErr) {
          console.error(updErr)
          sendError("Failed to update usage")
          return
        }

        const { data: inserted, error: genErr } = await supabase
          .from("generations")
          .insert({
            clerk_id: userId,
            description: rawDescription,
            result: architecture,
            tech_stack: techStack || "Any",
          })
          .select("id")
          .single()

        if (genErr || !inserted) {
          console.error(genErr)
          sendError("Failed to persist generation")
          return
        }

        enqueue({
          done: true,
          architecture: redactArchitectureForPlan(architecture, plan),
          generationId: inserted.id,
        })
        controller.close()
      } catch (e) {
        console.error(e)
        sendError(formatAiError(e))
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

function buildArchitectureFromModelText(rawText: string, finishReason: string | null): Architecture {
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

async function callArchitectureModel({
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

function formatAiError(error: unknown): string {
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
