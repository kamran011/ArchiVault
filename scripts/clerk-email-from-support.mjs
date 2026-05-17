/**
 * Set Clerk email templates + instance default sender to support@archivolt.dev.
 *
 * Usage (development — uses .env.local):
 *   node scripts/clerk-email-from-support.mjs
 *
 * Usage (production — archivolt.dev; uses CLERK_SECRET_KEY_PROD from .env.local):
 *   node scripts/clerk-email-from-support.mjs --prod
 *   # or: node scripts/clerk-email-from-support.mjs --key sk_live_...
 */
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

function loadEnvLocal() {
  try {
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
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    /* optional */
  }
}

function parseArgs() {
  const args = process.argv.slice(2)
  const keyIdx = args.indexOf("--key")
  if (keyIdx !== -1 && args[keyIdx + 1]) {
    return { key: args[keyIdx + 1].trim(), prod: false }
  }
  return { prod: args.includes("--prod") }
}

loadEnvLocal()
const { key: cliKey, prod } = parseArgs()

const key = (
  cliKey ||
  (prod ? process.env.CLERK_SECRET_KEY_PROD : null) ||
  process.env.CLERK_SECRET_KEY
)?.trim()
if (!key) {
  console.error(
    prod
      ? "Missing CLERK_SECRET_KEY_PROD in .env.local (or pass --key sk_live_...)"
      : "Missing CLERK_SECRET_KEY. Use --prod for production or pass --key sk_live_...",
  )
  process.exit(1)
}

const keyType = key.startsWith("sk_live")
  ? "PRODUCTION (sk_live)"
  : key.startsWith("sk_test")
    ? "DEVELOPMENT (sk_test)"
    : "unknown"

if (key.startsWith("sk_test") && !prod) {
  console.warn(
    "\n⚠  Using sk_test (development). For archivolt.dev run:\n" +
      "   node scripts/clerk-email-from-support.mjs --prod\n",
  )
}

const headers = {
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
}

async function api(method, path, body) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(data)}`)
  }
  return data
}

const instance = await api("GET", "/instance")
console.log(`\nClerk instance: ${instance.id ?? "—"} (${keyType})`)
console.log(`Environment: ${instance.environment_type ?? instance.environment ?? "—"}\n`)

try {
  await api("PATCH", "/beta_features/instance_settings", {
    from_email_address: "support",
  })
  console.log("✓ Instance default from_email_address → support@")
} catch (err) {
  console.warn(`⚠ Instance settings — skipped (${err.message})`)
}

const list = await api("GET", "/templates/email")
const templates = Array.isArray(list) ? list : list.data ?? []

console.log(`\nUpdating ${templates.length} email templates...\n`)

let updated = 0
let skipped = 0
let already = 0

for (const t of templates) {
  const slug = t.slug
  const current = await api("GET", `/templates/email/${slug}`)
  const from = current.from_email_name ?? "noreply"
  const reply = current.reply_to_email_name ?? ""

  if (from === "support" && reply === "support") {
    console.log(`✓ ${slug} — already support@`)
    already++
    continue
  }

  try {
    await api("PUT", `/templates/email/${slug}`, {
      name: current.name,
      subject: current.subject,
      body: current.body,
      markup: current.markup ?? undefined,
      delivered_by_clerk: current.delivered_by_clerk,
      from_email_name: "support",
      reply_to_email_name: "support",
    })
    console.log(`✓ ${slug} — ${from}@ → support@`)
    updated++
  } catch (err) {
    console.warn(`⚠ ${slug} — skipped (${err.message})`)
    skipped++
  }
}

const verify = await api("GET", "/templates/email/new_device_sign_in")
console.log("\n--- Verification: new_device_sign_in ---")
console.log("  from_email_name:", verify.from_email_name)
console.log("  reply_to_email_name:", verify.reply_to_email_name)
console.log(`\nDone. Updated: ${updated}, already OK: ${already}, skipped: ${skipped}`)
if (skipped > 0 && key.startsWith("sk_live")) {
  console.log(
    "\n⚠ Production Hobby plan blocks per-template API edits (402 custom_email_template).\n" +
      "   Instance default from_email_address was set to support@ when PATCH succeeded.\n" +
      "   If emails still show noreply@, set From/Reply-To in Clerk Dashboard (Production):\n" +
      "   https://dashboard.clerk.com/~/customization/email → New device sign in → support\n",
  )
} else if (key.startsWith("sk_test") && !prod) {
  console.log("\n→ Run: node scripts/clerk-email-from-support.mjs --prod")
}
