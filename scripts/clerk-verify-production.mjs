/**
 * Verify production Clerk keys and instance (run locally with .env.local).
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
  console.log("Sample user count check:", list.totalCount >= 0 ? "yes" : "n/a")
} catch (e) {
  console.error("Clerk API error:", e.message ?? e)
  process.exit(1)
}

console.log(`
Vercel Production checklist:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_... (same instance as secret)
  CLERK_SECRET_KEY = sk_live_...
  NEXT_PUBLIC_CLERK_DOMAIN = archivolt.dev
  NEXT_PUBLIC_APP_URL = https://www.archivolt.dev
  UNSET NEXT_PUBLIC_CLERK_PROXY_URL unless proxy is enabled in Clerk Dashboard
`)
