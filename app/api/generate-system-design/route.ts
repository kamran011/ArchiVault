import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import {
  createAnthropicTextMessage,
  ANTHROPIC_SYSTEM_DESIGN_MAX_OUTPUT_TOKENS,
  cachedSystemPrompt,
} from "@/lib/anthropic"
import { getGroqClient, groqMaxOutputTokens } from "@/lib/groq"
import { parseModelJson } from "@/lib/parse-model-json"
import { canAccessSystemDesign, type UserPlan } from "@/lib/plan-gate"
import { resolveSimulatedPlan } from "@/lib/dev-plan-simulate"
import { getServiceRoleClient } from "@/lib/supabase"
import { slimArchitectureForAi } from "@/lib/slim-architecture-for-ai"
import { SYSTEM_DESIGN_PROMPT_COMPACT } from "@/lib/system-design-prompt"
import type { Architecture, SystemDesign } from "@/types/architecture"
import { z } from "zod"

const bodySchema = z.object({
  architecture: z.record(z.string(), z.unknown()),
  generationId: z.string().uuid().optional(),
})

const USER_PROMPT_SUFFIX = `

Return ONLY the systemDesign JSON object.`

function buildUserPrompt(architecture: Record<string, unknown>) {
  const slim = slimArchitectureForAi(architecture)
  return `Analyze this VBD architecture and generate system design pattern recommendations:

${JSON.stringify(slim)}
${USER_PROMPT_SUFFIX}`
}

function parseSystemDesign(text: string): SystemDesign | null {
  const parsed = parseModelJson(text) as { systemDesign?: SystemDesign } | SystemDesign
  const systemDesign =
    "systemDesign" in parsed && parsed.systemDesign
      ? parsed.systemDesign
      : (parsed as SystemDesign)
  if (!systemDesign?.patterns || !Array.isArray(systemDesign.patterns)) {
    return null
  }
  return systemDesign
}

async function callSystemDesignModel({
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
        { role: "system", content: SYSTEM_DESIGN_PROMPT_COMPACT },
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
    system: cachedSystemPrompt(SYSTEM_DESIGN_PROMPT_COMPACT),
    userPrompt,
    maxTokens: anthropicMaxTokens,
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
      return "Request too large for the AI provider — try again shortly."
    }
    return "AI rate limit reached — wait a minute and try again."
  }

  if (raw.includes("413") || raw.includes("too large")) {
    return "Request too large for the AI provider — try again shortly."
  }

  return "AI service unavailable. Try again shortly."
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("plan")
    .eq("clerk_id", userId)
    .maybeSingle()

  if (userErr) {
    console.error(userErr)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const plan = resolveSimulatedPlan((user?.plan ?? "free") as UserPlan)
  if (!canAccessSystemDesign(plan)) {
    return NextResponse.json({ error: "System Design requires Team plan" }, { status: 403 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { architecture, generationId } = body

  const groqKey = process.env.GROQ_API_KEY?.trim()
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()

  if (!groqKey && !anthropicKey) {
    return NextResponse.json(
      { error: "AI not configured. Set GROQ_API_KEY (Groq) or ANTHROPIC_API_KEY (Claude)." },
      { status: 503 },
    )
  }

  const userPrompt = buildUserPrompt(architecture)
  const groqMaxTokens = groqKey
    ? groqMaxOutputTokens(SYSTEM_DESIGN_PROMPT_COMPACT, userPrompt)
    : 6000
  const anthropicMaxTokens = ANTHROPIC_SYSTEM_DESIGN_MAX_OUTPUT_TOKENS

  let systemDesign: SystemDesign
  try {
    const { text, finishReason } = await callSystemDesignModel({
      groqKey,
      userPrompt,
      groqMaxTokens,
      anthropicMaxTokens,
    })

    if (finishReason === "length") {
      const partial = parseSystemDesign(text)
      if (!partial) {
        return NextResponse.json(
          { error: "Generation was cut off — try again." },
          { status: 502 },
        )
      }
      systemDesign = partial
    } else {
      const parsed = parseSystemDesign(text)
      if (!parsed) {
        return NextResponse.json({ error: "Failed to parse system design" }, { status: 502 })
      }
      systemDesign = parsed
    }
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : "AI service unavailable"
    if (message.includes("GROQ_API_KEY") || message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI not configured. Set GROQ_API_KEY (Groq) or ANTHROPIC_API_KEY (Claude)." },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: formatAiError(error) }, { status: 502 })
  }

  if (generationId) {
    const { data: existing, error: fetchErr } = await supabase
      .from("generations")
      .select("clerk_id, result")
      .eq("id", generationId)
      .maybeSingle()

    if (fetchErr) {
      console.error(fetchErr)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    if (existing.clerk_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const merged = {
      ...(existing.result as Architecture),
      systemDesign,
    }

    const { error: updateErr } = await supabase
      .from("generations")
      .update({ result: merged })
      .eq("id", generationId)

    if (updateErr) {
      console.error(updateErr)
      return NextResponse.json({ error: "Failed to save system design" }, { status: 500 })
    }
  }

  return NextResponse.json({ systemDesign })
}
