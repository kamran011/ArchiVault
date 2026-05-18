import { NextResponse } from "next/server"
import {
  architectureBodySchema,
  buildArchitectureFromModelText,
  buildUserPrompt,
  callArchitectureModel,
  DESCRIPTION_AI_MAX,
  encodeSse,
  formatAiError,
  streamAnthropicTextMessage,
  cachedSystemPrompt,
  VBD_SYSTEM_PROMPT_CORE,
  ANTHROPIC_CORE_MAX_OUTPUT_TOKENS,
} from "@/lib/architecture-generation-core"
import {
  guestCookieHeader,
  hashIp,
  newGuestToken,
  parseGuestToken,
} from "@/lib/guest-cookie"
import { groqMaxOutputTokens } from "@/lib/groq"
import { ANTHROPIC_MODEL_FALLBACK_CHAIN } from "@/lib/anthropic"
import { VBD_SYSTEM_PROMPT_GROQ_CORE } from "@/lib/vbd-prompt"
import { redactArchitectureForPlan } from "@/lib/plan-gate"
import { getServiceRoleClient } from "@/lib/supabase"
import { messageForGuestInsertFailure } from "@/lib/guest-generation-errors"

const GUEST_IP_DAILY_LIMIT = 5

function clientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null
  return req.headers.get("x-real-ip")
}

export async function POST(req: Request) {
  const supabase = getServiceRoleClient()
  if (supabase instanceof NextResponse) return supabase

  const cookieHeader = req.headers.get("cookie")
  let guestToken = parseGuestToken(cookieHeader)
  const isNewGuest = !guestToken
  if (!guestToken) guestToken = newGuestToken()

  const { data: existing } = await supabase
    .from("guest_generations")
    .select("id")
    .eq("guest_token", guestToken)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "You have already used your free guest blueprint. Sign up to save results and generate again." },
      { status: 403 },
    )
  }

  const ipHash = hashIp(clientIp(req))
  if (ipHash) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: ipErr } = await supabase
      .from("guest_generations")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", dayAgo)

    if (ipErr) {
      console.error(ipErr)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (count !== null && count >= GUEST_IP_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Guest limit reached for today. Sign up for a free account to continue." },
        { status: 429 },
      )
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsedBody = architectureBodySchema.safeParse(body)
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
  const tokenForSave = guestToken

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
            model: "claude-sonnet-4-6",
            modelFallbackChain: ANTHROPIC_MODEL_FALLBACK_CHAIN,
            onTextDelta: (text) => enqueue({ chunk: text }),
          })
          rawText = result.text
          finishReason = result.stopReason === "max_tokens" ? "length" : result.stopReason
        }

        let architecture
        try {
          architecture = buildArchitectureFromModelText(rawText, finishReason)
        } catch {
          sendError("The model returned invalid JSON. Please try again.")
          return
        }

        const { error: insertErr } = await supabase.from("guest_generations").insert({
          guest_token: tokenForSave,
          ip_hash: ipHash,
          description: rawDescription,
          result: architecture,
        })

        if (insertErr) {
          console.error("[guest generate] insert guest_generations:", insertErr.code, insertErr.message, insertErr)
          if (insertErr.code === "23505") {
            sendError("You have already used your free guest blueprint. Sign up to continue.")
            return
          }
          sendError(messageForGuestInsertFailure(insertErr))
          return
        }

        enqueue({
          done: true,
          architecture: redactArchitectureForPlan(architecture, "free"),
        })
        controller.close()
      } catch (e) {
        console.error(e)
        sendError(formatAiError(e))
      }
    },
  })

  const response = new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })

  if (isNewGuest) {
    response.headers.append("Set-Cookie", guestCookieHeader(guestToken))
  }

  return response
}
