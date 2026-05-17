/**
 * Create Archivolt products on Polar (sandbox or production).
 * Usage: node scripts/polar-setup-products.mjs
 * Requires POLAR_ACCESS_TOKEN in .env.local (see .env.local.example).
 */
import { readFileSync, writeFileSync } from "fs"
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
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")

if (!accessToken) {
  console.error(
    server === "production"
      ? "Missing POLAR_ACCESS_TOKEN_PROD (or POLAR_ACCESS_TOKEN) in .env.local"
      : "Missing POLAR_ACCESS_TOKEN_DEV (or POLAR_ACCESS_TOKEN) in .env.local",
  )
  console.error("Sandbox: https://sandbox.polar.sh → Settings → Developers")
  process.exit(1)
}

const PLANS = [
  {
    plan: "blueprint",
    envKey: "POLAR_BLUEPRINT_PRODUCT_ID",
    create: {
      name: "Archivolt Blueprint",
      description: "4 architecture generations (one-time). PDF export, scaffold prompt, saved history.",
      metadata: { plan: "blueprint", app: "archivolt" },
      prices: [{ amountType: "fixed", priceCurrency: "usd", priceAmount: 4900 }],
    },
  },
  {
    plan: "pro",
    envKey: "POLAR_PRO_PRODUCT_ID",
    create: {
      name: "Archivolt Pro",
      description: "Unlimited generations, Tech Stack tab, everything in Blueprint.",
      metadata: { plan: "pro", app: "archivolt" },
      recurringInterval: "month",
      recurringIntervalCount: 1,
      prices: [{ amountType: "fixed", priceCurrency: "usd", priceAmount: 2900 }],
    },
  },
  {
    plan: "team",
    envKey: "POLAR_TEAM_PRODUCT_ID",
    create: {
      name: "Archivolt Team",
      description: "Unlimited generations, System Design tab, everything in Pro.",
      metadata: { plan: "team", app: "archivolt" },
      recurringInterval: "month",
      recurringIntervalCount: 1,
      prices: [{ amountType: "fixed", priceCurrency: "usd", priceAmount: 4900 }],
    },
  },
  {
    plan: "test",
    envKey: "POLAR_TEST_PRODUCT_ID",
    create: {
      name: "Archivolt Test Checkout ($2)",
      description: "Dev-only: verify Polar checkout and webhooks. Grants Blueprint after payment.",
      metadata: { plan: "test", app: "archivolt" },
      prices: [{ amountType: "fixed", priceCurrency: "usd", priceAmount: 200 }],
    },
  },
]

async function listAllProducts(polar) {
  const all = []
  const pages = await polar.products.list({ limit: 100 })
  for await (const page of pages) {
    const items = page?.result?.items ?? page?.items
    if (Array.isArray(items)) all.push(...items)
  }
  return all
}

function findExisting(products, plan) {
  return products.find((p) => {
    const meta = p.metadata ?? {}
    return meta.plan === plan || meta.plan === String(plan)
  })
}

function upsertEnvLocal(ids) {
  const path = resolve(root, ".env.local")
  let content = ""
  try {
    content = readFileSync(path, "utf8")
  } catch {
    console.warn("No .env.local found; printing IDs only.")
    return
  }
  for (const [key, value] of Object.entries(ids)) {
    const re = new RegExp(`^${key}=.*$`, "m")
    if (re.test(content)) {
      content = content.replace(re, `${key}=${value}`)
    } else {
      content += `\n${key}=${value}`
    }
  }
  const serverKey = "POLAR_SERVER_DEV"
  const serverRe = new RegExp(`^${serverKey}=.*$`, "m")
  if (serverRe.test(content)) {
    content = content.replace(serverRe, `${serverKey}=${server}`)
  } else if (!/^POLAR_SERVER_DEV=/m.test(content)) {
    content += `\n${serverKey}=${server}\n`
  }
  writeFileSync(path, content, "utf8")
  console.log("\nUpdated .env.local with product IDs.")
}

async function main() {
  const polar = new Polar({ accessToken, server })
  console.log(`Polar server: ${server}\n`)

  const existing = await listAllProducts(polar)
  const ids = {}
  const checkoutUrls = {}

  for (const spec of PLANS) {
    let product = findExisting(existing, spec.plan)
    if (product) {
      console.log(`✓ ${spec.plan}: already exists (${product.id})`)
    } else {
      product = await polar.products.create(spec.create)
      console.log(`+ ${spec.plan}: created (${product.id})`)
    }
    ids[spec.envKey] = product.id

    const checkout = await polar.checkouts.create({
      products: [product.id],
      metadata: { plan: spec.plan },
      successUrl: `${appUrl}/dashboard?checkout=success`,
    })
    checkoutUrls[spec.plan] = checkout.url ?? "(no url)"
  }

  console.log("\n--- Add to .env.local ---")
  for (const [k, v] of Object.entries(ids)) {
    console.log(`${k}=${v}`)
  }

  console.log("\n--- Sample checkout URLs (guest; app uses /api/polar/checkout when signed in) ---")
  for (const [plan, url] of Object.entries(checkoutUrls)) {
    console.log(`${plan}: ${url}`)
  }

  upsertEnvLocal(ids)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
