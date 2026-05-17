/**
 * Set Polar organization avatar (checkout / emails / portal logo).
 * Usage: node scripts/polar-set-org-logo.mjs
 *
 * Logo must be a public HTTPS URL Polar can fetch (not localhost).
 * Default: https://www.archivolt.dev/apple-icon.png
 */
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { Polar } from "@polar-sh/sdk"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

function loadEnvFile(filename, { override = false } = {}) {
  try {
    const raw = readFileSync(resolve(root, filename), "utf8")
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
      if (!val) continue
      if (override || !process.env[key]) process.env[key] = val
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(".env.local.example")
loadEnvFile(".env.local", { override: true })

const serverRaw =
  process.env.POLAR_SERVER_DEV?.trim() ||
  process.env.POLAR_SERVER?.trim() ||
  "sandbox"
const server = serverRaw.toLowerCase() === "production" ? "production" : "sandbox"
const accessToken =
  server === "production"
    ? (process.env.POLAR_ACCESS_TOKEN_PROD || process.env.POLAR_ACCESS_TOKEN)?.trim()
    : (process.env.POLAR_ACCESS_TOKEN_DEV || process.env.POLAR_ACCESS_TOKEN)?.trim()
const orgId = process.env.POLAR_ORGANIZATION_ID?.trim()
const avatarUrl =
  process.env.POLAR_ORG_AVATAR_URL?.trim() || "https://www.archivolt.dev/apple-icon.png"
function resolveWebsite() {
  const raw = process.env.POLAR_ORG_WEBSITE?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || ""
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) return "https://www.archivolt.dev"
  return raw.replace(/\/$/, "") || "https://www.archivolt.dev"
}

const website = resolveWebsite()

if (!accessToken) {
  console.error(
    server === "production"
      ? "Missing POLAR_ACCESS_TOKEN_PROD in .env.local"
      : "Missing POLAR_ACCESS_TOKEN_DEV in .env.local",
  )
  process.exit(1)
}

async function listOrgs(polar) {
  const orgs = []
  for await (const page of await polar.organizations.list({ limit: 20 })) {
    const items = page?.result?.items ?? page?.items
    if (Array.isArray(items)) orgs.push(...items)
  }
  return orgs
}

async function main() {
  const polar = new Polar({ accessToken, server })
  console.log(`Polar server: ${server}`)

  let id = orgId
  if (!id) {
    const orgs = await listOrgs(polar)
    const archivolt = orgs.find((o) => o.slug === "archivolt" || o.name?.toLowerCase().includes("archivolt"))
    const org = archivolt ?? orgs[0]
    if (!org?.id) {
      console.error("No organization found. Set POLAR_ORGANIZATION_ID in .env.local")
      process.exit(1)
    }
    id = org.id
    console.log(`Organization: ${org.name} (${org.slug}) → ${id}`)
  }

  const updated = await polar.organizations.update({
    id,
    organizationUpdate: {
      avatarUrl,
      website: website.replace(/\/$/, ""),
    },
  })

  console.log("\nUpdated organization branding:")
  console.log(`  avatar_url: ${updated.avatarUrl ?? avatarUrl}`)
  console.log(`  website:    ${updated.website ?? website}`)
  console.log("\nOpen a checkout link to confirm the logo renders.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
