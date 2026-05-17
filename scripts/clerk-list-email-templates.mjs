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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
  process.env[t.slice(0, i).trim()] = val
}

const key = process.env.CLERK_SECRET_KEY
const res = await fetch("https://api.clerk.com/v1/templates/email", {
  headers: { Authorization: `Bearer ${key}` },
})
const list = await res.json()
const templates = Array.isArray(list) ? list : list.data ?? []
for (const t of templates) {
  console.log(`${t.slug.padEnd(40)} from=${t.from_email_name ?? "?"} reply=${t.reply_to_email_name ?? "-"}`)
}
