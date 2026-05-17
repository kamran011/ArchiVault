/**
 * One-time Resend domain setup for archivolt.dev
 * Usage: node scripts/setup-resend-domain.mjs
 * Requires RESEND_API_KEY in .env.local (load manually or export)
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
  }
}

loadEnvLocal()

const DOMAIN = "archivolt.dev"
const apiKey = process.env.RESEND_API_KEY?.trim()

if (!apiKey) {
  console.error("Missing RESEND_API_KEY. Add it to architectai/.env.local then re-run.")
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
}

async function api(path, options = {}) {
  const res = await fetch(`https://api.resend.com${path}`, { ...options, headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(JSON.stringify(body))
  }
  return body
}

async function main() {
  const list = await api("/domains")
  let domain = list.data?.find((d) => d.name === DOMAIN)

  if (!domain) {
    console.log(`Creating domain ${DOMAIN}...`)
    domain = await api("/domains", {
      method: "POST",
      body: JSON.stringify({ name: DOMAIN }),
    })
  } else {
    console.log(`Domain ${DOMAIN} already exists (status: ${domain.status})`)
    domain = await api(`/domains/${domain.id}`)
  }

  console.log("\n--- Add these DNS records in Cloudflare (DNS only) ---\n")
  for (const record of domain.records ?? []) {
    const prio = record.priority ? ` priority=${record.priority}` : ""
    console.log(`${record.type}\t${record.name}\t${record.value}\t(${record.status})${prio}`)
  }

  console.log("\n--- Triggering verification ---\n")
  await api(`/domains/${domain.id}/verify`, { method: "POST" })
  const updated = await api(`/domains/${domain.id}`)
  console.log(`Status: ${updated.status}`)
  console.log("\nWhen status is 'verified', waitlist emails can send from support@archivolt.dev")
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
