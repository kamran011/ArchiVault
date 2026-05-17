/**
 * Verify production Clerk keys, instance, and domains (run locally with .env.local).
 * Usage: node scripts/clerk-verify-production.mjs
 */
import { createClerkClient } from "@clerk/backend"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

function loadEnvFile(filename) {
  try {
    const raw = readFileSync(resolve(root, filename), "utf8")
    for (const line of raw.split("\n")) {
      const t = line.trim()
      if (!t || t.startsWith("#")) continue
      const i = t.indexOf("=")
      if (i === -1) continue
      const key = t.slice(0, i).trim()
      let val = t.slice(i + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(".env.local")

const secret =
  process.env.CLERK_SECRET_KEY_PROD?.trim() ||
  process.env.CLERK_SECRET_KEY?.trim()
const publishable =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD?.trim() ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()

if (!secret) {
  console.error("Missing CLERK_SECRET_KEY_PROD or CLERK_SECRET_KEY")
  process.exit(1)
}

console.log("Publishable key prefix:", publishable?.slice(0, 12) ?? "(not set)")
console.log("Secret key prefix:", secret.slice(0, 12))

const clerk = createClerkClient({ secretKey: secret })

try {
  const list = await clerk.users.getUserList({ limit: 1 })
  console.log("OK: Clerk API reachable, instance valid.")
  console.log("Users in instance:", list.totalCount)
} catch (e) {
  console.error("Clerk API error:", e.message ?? e)
  process.exit(1)
}

const domainsRes = await fetch("https://api.clerk.com/v1/domains", {
  headers: { Authorization: `Bearer ${secret}` },
})
if (!domainsRes.ok) {
  console.error("Domains API failed:", domainsRes.status, await domainsRes.text())
  process.exit(1)
}

const { data: domains } = await domainsRes.json()
console.log("\n--- Clerk domains (production instance) ---")
for (const d of domains) {
  console.log(
    `  ${d.name}  satellite=${d.is_satellite}  frontend=${d.frontend_api_url ?? "n/a"}`,
  )
}

const names = domains.map((d) => d.name)
const hasWww = names.some((n) => n === "www.archivolt.dev")
const hasApex = names.some((n) => n === "archivolt.dev")

console.log("\n--- Domain check for Archivolt ---")
if (hasApex && !hasWww) {
  console.log(
    "✓ Primary domain archivolt.dev is registered.",
  )
  console.log(
    "✗ www.archivolt.dev is NOT registered (satellite domains require Clerk paid plan).",
  )
  console.log(
    "  → Use https://archivolt.dev as canonical URL (app redirects www → apex).",
  )
  console.log(
    "  → Do NOT set NEXT_PUBLIC_CLERK_DOMAIN=www.archivolt.dev",
  )
} else if (hasWww) {
  console.log("✓ www.archivolt.dev is registered — you may use www as app host.")
}

console.log(`
Vercel Production checklist:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
  CLERK_SECRET_KEY = sk_live_...
  NEXT_PUBLIC_CLERK_DOMAIN = archivolt.dev
  NEXT_PUBLIC_APP_URL = https://archivolt.dev
  UNSET NEXT_PUBLIC_CLERK_PROXY_URL (unless proxy enabled in Clerk Dashboard)
  Polar webhook: https://archivolt.dev/api/polar/webhook
`)
