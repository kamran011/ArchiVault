/**
 * Send one waitlist confirmation test email.
 * Usage: node scripts/test-waitlist-email.mjs [to@email.com]
 */
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

function loadEnvLocal() {
  const raw = readFileSync(resolve(root, ".env.local"), "utf8")
  for (const line of raw.split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

loadEnvLocal()

const to = process.argv[2] ?? "kamranqayyum35202@gmail.com"
const apiKey = process.env.RESEND_API_KEY?.trim()
const from = process.env.RESEND_FROM?.trim() ?? "Archivolt <support@archivolt.dev>"
const replyTo = process.env.RESEND_REPLY_TO?.trim() ?? "support@archivolt.dev"

if (!apiKey) {
  console.error("Missing RESEND_API_KEY in .env.local")
  process.exit(1)
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    reply_to: replyTo,
    subject: "You're on the Pro early-bird list — Archivolt",
    html: "<p>Test: waitlist confirmation from Archivolt. If you received this, Resend is working.</p>",
    text: "Test: waitlist confirmation from Archivolt. If you received this, Resend is working.",
  }),
})

const body = await res.json()
if (!res.ok) {
  console.error("Send failed:", body)
  process.exit(1)
}

console.log("Sent OK. Email id:", body.id)
console.log("From:", from)
console.log("To:", to)
