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

const key = process.env.CLERK_SECRET_KEY_PROD?.trim()
if (!key) {
  console.error("Set CLERK_SECRET_KEY_PROD in .env.local (save file) or env")
  process.exit(1)
}

const h = { Authorization: `Bearer ${key}` }
async function get(path) {
  const r = await fetch(`https://api.clerk.com/v1${path}`, { headers: h })
  return { status: r.status, data: await r.json() }
}

const inst = await get("/instance")
console.log("Instance:", inst.data.id, inst.data.environment_type)

const settings = await get("/beta_features/instance_settings")
console.log("\nInstance settings:", JSON.stringify(settings.data, null, 2))

const tpl = await get("/templates/email/new_device_sign_in")
console.log("\nnew_device_sign_in:")
console.log("  from_email_name:", tpl.data.from_email_name)
console.log("  reply_to_email_name:", tpl.data.reply_to_email_name)
console.log("  delivered_by_clerk:", tpl.data.delivered_by_clerk)
