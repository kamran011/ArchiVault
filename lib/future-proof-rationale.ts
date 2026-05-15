import { z } from "zod"

export const futureProofDeductionSchema = z.object({
  points: z.number(),
  reason: z.string(),
})

export const futureProofScenarioSchema = z.object({
  title: z.string(),
  trigger: z.string(),
  whatChanges: z.string(),
  whatStaysStable: z.string(),
})

export const futureProofRationaleSchema = z.object({
  headline: z.string(),
  axesCovered: z.array(z.string()),
  deductions: z.array(futureProofDeductionSchema),
  scenarios: z.array(futureProofScenarioSchema).min(2).max(3),
})

export type FutureProofDeduction = z.infer<typeof futureProofDeductionSchema>
export type FutureProofScenario = z.infer<typeof futureProofScenarioSchema>
export type FutureProofRationale = z.infer<typeof futureProofRationaleSchema>

/** JSON schema fragment for VBD prompts. */
export const FUTURE_PROOF_RATIONALE_JSON_SPEC = `"futureProofRationale": {
    "headline": "string — 1-2 sentences summarizing why this score",
    "axesCovered": ["string — I-prefixed interface names well isolated behind adapters"],
    "deductions": [{ "points": number, "reason": "string — missed mandatory axis or weakness" }],
    "scenarios": [{
      "title": "string — short scenario name",
      "trigger": "string — business or technical change that happens",
      "whatChanges": "string — only the adapter behind which interface",
      "whatStaysStable": "string — core orchestration and services that stay untouched"
    }]
  }`

/** Flatten structured rationale for PDF / legacy consumers. */
export function rationaleToExplanation(rationale: FutureProofRationale): string {
  const parts = [rationale.headline]

  if (rationale.axesCovered.length > 0) {
    parts.push(`Axes covered: ${rationale.axesCovered.join(", ")}.`)
  }

  for (const d of rationale.deductions) {
    parts.push(`Deduction (−${d.points}): ${d.reason}`)
  }

  for (const s of rationale.scenarios) {
    parts.push(
      `${s.title} — ${s.trigger} Changes: ${s.whatChanges} Stable: ${s.whatStaysStable}`,
    )
  }

  return parts.join(" ")
}

const INTERFACE_RE = /\bI[A-Z][a-zA-Z0-9]+\b/g

/** Best-effort parse of legacy prose explanations into structured rationale. */
export function parseLegacyFutureProofExplanation(
  explanation: string,
  score: number,
): FutureProofRationale | null {
  const text = explanation.trim()
  if (!text) return null

  const scenarioParts = text.split(/\s*Scenario\s+\d+\s*[—–-]\s*/i)
  const preamble = scenarioParts[0]?.trim() ?? ""
  const scenarioBodies = scenarioParts.slice(1).map((s) => s.trim()).filter(Boolean)

  const axes = [...new Set(preamble.match(INTERFACE_RE) ?? [])]

  let headline = preamble
  const scorePrefix = text.match(/^Score of \d+\/100\.\s*/i)
  if (scorePrefix) {
    headline = preamble.slice(scorePrefix[0].length).trim()
  }
  if (!headline) {
    headline = `Score ${score}/100`
  }

  const deductions: FutureProofDeduction[] = []
  const deductionMatch = preamble.match(
    /(?:minor |major )?deduction[^.]*?(?:for|because)\s+([^.]+)\./i,
  )
  if (deductionMatch) {
    deductions.push({ points: Math.min(10, Math.max(1, 100 - score)), reason: deductionMatch[1].trim() })
  }

  const scenarios: FutureProofScenario[] = scenarioBodies.map((body, i) => {
    const colonIdx = body.indexOf(":")
    const title =
      colonIdx > 0 ? body.slice(0, colonIdx).trim() : `Scenario ${i + 1}`
    const rest = colonIdx > 0 ? body.slice(colonIdx + 1).trim() : body

    const onlyMatch = rest.match(/^(.+?)\.\s*(?:The |Only )/i)
    const trigger = onlyMatch ? onlyMatch[1].trim() : rest.split(".")[0]?.trim() ?? rest

    const changesMatch = rest.match(
      /(?:only |Only )(?:the )?([^.]+?)(?:\.| changes| adapter)/i,
    )
    const stableMatch = rest.match(
      /(?:are |is )(?:completely )?untouched\.?|never need to be touched|no .+ code changes/i,
    )

    return {
      title,
      trigger,
      whatChanges: changesMatch?.[1]?.trim() ?? rest.slice(0, 120),
      whatStaysStable: stableMatch
        ? rest.slice(stableMatch.index ?? 0).replace(/^[^.]+\.\s*/, "").trim() || "Core orchestration and domain services remain unchanged."
        : "Core services and orchestration stay stable.",
    }
  })

  if (scenarios.length < 2 && preamble.length > 80) {
    return {
      headline: headline.slice(0, 280),
      axesCovered: axes,
      deductions,
      scenarios:
        scenarios.length > 0
          ? scenarios
          : [
              {
                title: "Architecture resilience",
                trigger: "Future requirement or provider change",
                whatChanges: "Only the relevant adapter behind its interface",
                whatStaysStable: "Core orchestration and dependent services",
              },
              {
                title: "Operational evolution",
                trigger: "Scale or compliance shift",
                whatChanges: "Infrastructure or compliance adapters",
                whatStaysStable: "Stable core workflows and contracts",
              },
            ],
    }
  }

  if (scenarios.length < 2) return null

  return {
    headline: headline.slice(0, 280),
    axesCovered: axes,
    deductions,
    scenarios: scenarios.slice(0, 3),
  }
}

export function resolveFutureProofRationale(
  architecture: {
    futureProofScore: number
    futureProofExplanation?: string
    futureProofRationale?: FutureProofRationale
  },
): FutureProofRationale | null {
  if (architecture.futureProofRationale) {
    const parsed = futureProofRationaleSchema.safeParse(architecture.futureProofRationale)
    if (parsed.success) return parsed.data
  }

  if (architecture.futureProofExplanation) {
    return parseLegacyFutureProofExplanation(
      architecture.futureProofExplanation,
      architecture.futureProofScore,
    )
  }

  return null
}
