import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { techStackAnalysisSchema } from "@/lib/architecture-schema"
import {
  createAnthropicTextMessage,
  ANTHROPIC_TECH_STACK_MAX_OUTPUT_TOKENS,
  cachedSystemPrompt,
} from "@/lib/anthropic"
import { getGroqClient, groqMaxOutputTokens } from "@/lib/groq"
import { parseModelJson } from "@/lib/parse-model-json"
import { canAccessTechStack, type UserPlan } from "@/lib/plan-gate"
import { resolveSimulatedPlan } from "@/lib/dev-plan-simulate"
import { getServiceRoleClient } from "@/lib/supabase"
import { TECH_STACK_PROMPT } from "@/lib/tech-stack-prompt"
import { slimArchitectureForAi } from "@/lib/slim-architecture-for-ai"
import type { Architecture, TechStackAnalysis } from "@/types/architecture"
import { z } from "zod"

const bodySchema = z.object({
  architecture: z.record(z.string(), z.unknown()),
  generationId: z.string().uuid().optional(),
  techStack: z.string().optional(),
  scale: z.string().optional(),
  industry: z.string().optional(),
})

function buildUserPrompt(
  architecture: Record<string, unknown>,
  techStack: string,
  scale: string,
  industry: string,
) {
  return `Recommend a tech stack for this VBD architecture.

Tech Stack Preference: ${techStack}
Expected Scale: ${scale}
Industry: ${industry}

Architecture JSON:
${JSON.stringify(slimArchitectureForAi(architecture))}

Return ONLY the techStackAnalysis JSON object.`
}

async function callTechStackModel({
  groqKey,
  userPrompt,
  groqMaxTokens,
}: {
  groqKey?: string
  userPrompt: string
  groqMaxTokens: number
}): Promise<{ text: string; finishReason: string | null }> {
  if (groqKey) {
    const groq = getGroqClient()
    const model = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile"
    const completion = await groq.chat.completions.create({
      model,
      max_tokens: groqMaxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TECH_STACK_PROMPT },
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
    system: cachedSystemPrompt(TECH_STACK_PROMPT),
    userPrompt,
    maxTokens: ANTHROPIC_TECH_STACK_MAX_OUTPUT_TOKENS,
  })
  return {
    text,
    finishReason: stopReason === "max_tokens" ? "length" : stopReason,
  }
}

function formatAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)

  if (raw.includes("rate_limit_exceeded") || raw.includes("Rate limit")) {
    return "AI rate limit reached — wait a minute and try again."
  }

  if (raw.includes("413") || raw.includes("too large")) {
    return "Request too large for the AI provider — try again shortly."
  }

  return "AI service unavailable. Try again shortly."
}

function extractTechStackAnalysis(parsed: unknown): TechStackAnalysis | null {
  if (!parsed || typeof parsed !== "object") return null
  const candidate =
    "techStackAnalysis" in parsed && parsed.techStackAnalysis
      ? parsed.techStackAnalysis
      : parsed
  const validated = techStackAnalysisSchema.safeParse(candidate)
  return validated.success ? validated.data : null
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
  if (!canAccessTechStack(plan)) {
    return NextResponse.json({ error: "Tech Stack analysis requires Pro plan" }, { status: 403 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { architecture, generationId, techStack, scale, industry } = body

  const groqKey = process.env.GROQ_API_KEY?.trim()
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()

  if (!groqKey && !anthropicKey) {
    return NextResponse.json(
      { error: "AI not configured. Set GROQ_API_KEY (Groq) or ANTHROPIC_API_KEY (Claude)." },
      { status: 503 },
    )
  }

  let resolvedTechStack = techStack || "Any"
  const resolvedScale = scale || "Startup (0–10k users)"
  const resolvedIndustry = industry || "General"

  if (generationId) {
    const { data: row } = await supabase
      .from("generations")
      .select("clerk_id, tech_stack")
      .eq("id", generationId)
      .maybeSingle()

    if (!row) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }
    if (row.clerk_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (row.tech_stack) resolvedTechStack = row.tech_stack
  }

  const userPrompt = buildUserPrompt(
    architecture,
    resolvedTechStack,
    resolvedScale,
    resolvedIndustry,
  )
  const groqMaxTokens = groqKey
    ? groqMaxOutputTokens(TECH_STACK_PROMPT, userPrompt)
    : 8000

  let techStackAnalysis: TechStackAnalysis
  try {
    const { text, finishReason } = await callTechStackModel({
      groqKey,
      userPrompt,
      groqMaxTokens,
    })

    if (finishReason === "length") {
      try {
        const parsed = parseModelJson(text)
        const extracted = extractTechStackAnalysis(parsed)
        if (!extracted) {
          return NextResponse.json(
            { error: "Generation was cut off — try again." },
            { status: 502 },
          )
        }
        techStackAnalysis = extracted
      } catch {
        return NextResponse.json(
          { error: "Generation was cut off — try again." },
          { status: 502 },
        )
      }
    } else {
      const parsed = parseModelJson(text)
      const extracted = extractTechStackAnalysis(parsed)
      if (!extracted) {
        return NextResponse.json({ error: "Failed to parse tech stack analysis" }, { status: 502 })
      }
      techStackAnalysis = extracted
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
      techStackAnalysis,
    }

    const { error: updateErr } = await supabase
      .from("generations")
      .update({ result: merged })
      .eq("id", generationId)

    if (updateErr) {
      console.error(updateErr)
      return NextResponse.json({ error: "Failed to save tech stack analysis" }, { status: 500 })
    }
  }

  return NextResponse.json({ techStackAnalysis })
}
