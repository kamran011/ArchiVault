/**
 * Extract and parse JSON from LLM output that may include markdown fences or preamble.
 */
export function parseModelJson(rawText: string): unknown {
  const attempts = collectJsonCandidates(rawText)

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate)
    } catch {
      // try next candidate
    }
  }

  throw new Error("Invalid JSON")
}

function collectJsonCandidates(rawText: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  function push(value: string) {
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) return
    seen.add(trimmed)
    out.push(trimmed)
  }

  push(rawText)
  push(stripCodeFences(rawText))

  try {
    push(extractBalancedJsonObject(rawText))
  } catch {
    // no balanced object in raw text
  }

  try {
    const stripped = stripCodeFences(rawText)
    push(extractBalancedJsonObject(stripped))
  } catch {
    // no balanced object after fence strip
  }

  for (const base of [...out]) {
    push(repairTrailingCommas(base))
  }

  return out
}

function stripCodeFences(text: string): string {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim()
}

function extractBalancedJsonObject(text: string): string {
  const start = text.indexOf("{")
  if (start === -1) throw new Error("No JSON object start")

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (ch === "\\") {
        escaped = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
    } else if (ch === "{") {
      depth++
    } else if (ch === "}") {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }

  throw new Error("Unbalanced JSON object")
}

function repairTrailingCommas(json: string): string {
  return json.replace(/,\s*([}\]])/g, "$1")
}
