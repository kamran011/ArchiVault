import "server-only"

import Groq from "groq-sdk"

let singleton: Groq | null = null

export function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY?.trim()
  if (!key) {
    throw new Error("GROQ_API_KEY is not set")
  }
  if (!singleton) {
    singleton = new Groq({ apiKey: key })
  }
  return singleton
}
