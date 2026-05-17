/**
 * Diagnose Clerk instance + email template sender settings.
 */
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split("\n")) {
  const t = line.trim()
  if (!t || t.startsWith("#")) continue
  const i = t.indexOf("=")
  if (i === -1) continue
  let val = t.slice(i + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  process.env[t.slice(0, i).trim()] = val
}

const prod = process.argv.includes("--prod")
const key = (
  prod ? process.env.CLERK_SECRET_KEY_PROD : process.env.CLERK_SECRET_KEY
)?.trim()
if (!key) {
  console.error(prod ? "Missing CLERK_SECRET_KEY_PROD" : "Missing CLERK_SECRET_KEY (use --prod)")
  process.exit(1)
}

const keyHint = key.startsWith("sk_live") ? "PRODUCTION (sk_live)" : key.startsWith("sk_test") ? "DEVELOPMENT (sk_test)" : "unknown key type"

const headers = { Authorization: `Bearer ${key}` }

async function get(path) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(data)}`)
  return data
}

const instance = await get("/instance")
console.log("Clerk key type:", keyHint)
console.log("Instance:", instance.id ?? instance)
console.log("Environment:", instance.environment_type ?? instance.environment ?? "—")

const tpl = await get("/templates/email/new_device_sign_in")
console.log("\nnew_device_sign_in template:")
console.log("  from_email_name:", tpl.from_email_name)
console.log("  reply_to_email_name:", tpl.reply_to_email_name)
console.log("  delivered_by_clerk:", tpl.delivered_by_clerk)

const list = await get("/templates/email")
const templates = Array.isArray(list) ? list : list.data ?? []
const noreply = templates.filter((t) => (t.from_email_name ?? "noreply") !== "support")
console.log(`\nTemplates NOT using support@: ${noreply.length}`)
for (const t of noreply) {
  console.log(`  - ${t.slug}: from=${t.from_email_name ?? "(default noreply)"}`)
}
