import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { architectureSchema } from "@/lib/architecture-schema"
import { getAnthropicClient } from "@/lib/anthropic"
import { getGroqClient } from "@/lib/groq"
import { getServiceRoleClient } from "@/lib/supabase"
import { VBD_SYSTEM_PROMPT } from "@/lib/vbd-prompt"
import { redactArchitectureForPlan, type UserPlan } from "@/lib/plan-gate"
import { parseModelJson } from "@/lib/parse-model-json"
import { z } from "zod"

const bodySchema = z.object({
  description: z.string().min(10).max(20000),
  techStack: z.string().optional(),
  scale: z.string().optional(),
  industry: z.string().optional(),
})

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

  if (user.plan === "free" && user.generation_count >= 1) {
    return NextResponse.json({ error: "Generation limit reached. Upgrade to Pro." }, { status: 403 })
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

  const { description, techStack, scale, industry } = parsedBody.data

  const userPrompt = `
    System Description: ${description}
    Tech Stack Preference: ${techStack || "Any"}
    Expected Scale: ${scale || "Startup"}
    Industry: ${industry || "General"}

    Analyze this system using Volatility-Based Decomposition and return the architecture as a valid JSON object matching the exact schema specified in the system prompt. Do not return anything outside the JSON object.
  `

  const groqKey = process.env.GROQ_API_KEY?.trim()
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()

  if (!groqKey && !anthropicKey) {
    return NextResponse.json(
      { error: "AI not configured. Set GROQ_API_KEY (Groq) or ANTHROPIC_API_KEY (Claude)." },
      { status: 503 },
    )
  }

  let rawText: string
  let finishReason: string | null = null

  const groqMaxTokens = 8000
  const anthropicMaxTokens = 12000

  try {
    const result = await callArchitectureModel({
      groqKey,
      anthropicKey,
      userPrompt,
      groqMaxTokens,
      anthropicMaxTokens,
    })
    rawText = result.text
    finishReason = result.finishReason
  } catch (e) {
    console.error(e)
    const message = formatAiError(e)
    return NextResponse.json({ error: message }, { status: 502 })
  }

  if (finishReason === "length") {
    return NextResponse.json(
      { error: "Generation was cut off — try a shorter system description and retry." },
      { status: 502 },
    )
  }

  let parsedJson: unknown

  try {
    parsedJson = parseModelJson(rawText)
  } catch (firstErr) {
    console.error("JSON parse failed, retrying once:", firstErr)
    try {
      const retry = await callArchitectureModel({
        groqKey,
        anthropicKey,
        userPrompt: `${userPrompt}\n\nYour previous response was not valid JSON. Return ONLY one valid JSON object matching the schema. Escape newlines in scaffoldPrompt as \\\\n.`,
        groqMaxTokens,
        anthropicMaxTokens,
      })
      if (retry.finishReason === "length") {
        return NextResponse.json(
          { error: "Generation was cut off — try a shorter system description and retry." },
          { status: 502 },
        )
      }
      parsedJson = parseModelJson(retry.text)
    } catch (retryErr) {
      console.error("JSON parse retry failed:", retryErr)
      return NextResponse.json({ error: "The model returned invalid JSON. Please try again." }, { status: 502 })
    }
  }

  const validated = architectureSchema.safeParse(parsedJson)

  if (!validated.success) {
    return NextResponse.json(
      {
        error: "Generation failed — please try again.",
        details: validated.error.flatten(),
      },
      { status: 502 },
    )
  }

  const architecture = validated.data
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
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 })
  }

  const { error: genErr } = await supabase.from("generations").insert({
    clerk_id: userId,
    description,
    result: architecture,
    tech_stack: techStack || "Any",
  })

  if (genErr) {
    console.error(genErr)
    return NextResponse.json({ error: "Failed to persist generation" }, { status: 500 })
  }

  return NextResponse.json(redactArchitectureForPlan(architecture, user.plan as UserPlan))
}

async function callArchitectureModel({
  groqKey,
  anthropicKey,
  userPrompt,
  groqMaxTokens,
  anthropicMaxTokens,
}: {
  groqKey?: string
  anthropicKey?: string
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
        { role: "system", content: VBD_SYSTEM_PROMPT },
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

  const anthropic = getAnthropicClient()
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: anthropicMaxTokens,
    system: VBD_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  })
  const block = response.content[0]
  if (block.type !== "text") {
    throw new Error("Unexpected AI response")
  }
  return {
    text: block.text,
    finishReason: response.stop_reason === "max_tokens" ? "length" : response.stop_reason,
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

  return "AI service unavailable. Try again shortly."
}
