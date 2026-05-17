# Polar setup (Archivolt)

## Cursor MCP (recommended)

1. Reload MCP in Cursor (**Settings → MCP**).
2. Connect **Polar Sandbox** (OAuth) for local dev, then **Polar** for production.
3. Use MCP tools to list/create products and webhooks.

Config: [`.cursor/mcp.json`](../.cursor/mcp.json) and workspace [`.cursor/mcp.json`](../../.cursor/mcp.json).

If Polar MCP is not listed, add the servers manually and reload.

## One-command product setup (API)

With an organization access token in `.env.local`:

```bash
cd architectai
npm run polar:setup
```

This creates **Archivolt Blueprint** ($49 one-time), **Archivolt Pro** ($29/mo), and **Archivolt Team** ($49/mo), writes `POLAR_*_PRODUCT_ID` into `.env.local`, and prints sample checkout URLs.

## Checkout logo (fix broken icon)

Polar checkout shows your **organization avatar**, not something from the Next.js repo directly.

**Option A — Dashboard (easiest)**

1. Open [polar.sh/dashboard/archivolt](https://polar.sh/dashboard/archivolt) (or your org slug).
2. Go to **Settings** → **Organization** (or **General** / profile).
3. Upload a square logo (PNG, at least **128×128**, recommended **512×512**).
4. Save and refresh an existing checkout tab.

**Option B — Public URL via script**

Polar must load the image over **HTTPS** (production URL). Localhost paths will look broken.

```bash
cd architectai
# optional override
# set POLAR_ORG_AVATAR_URL=https://www.archivolt.dev/apple-icon.png
node scripts/polar-set-org-logo.mjs
```

Uses `https://www.archivolt.dev/apple-icon.png` by default (same asset as the app’s Apple touch icon).

## Products

Create three products in the Polar Dashboard (sandbox first, then production):

| Internal plan | Type | Suggested price |
|---------------|------|-----------------|
| Blueprint | One-time | $49 |
| Pro | Subscription (monthly) | $29/mo |
| Team | Subscription (monthly) | $49/mo |

Copy each **Product ID** (`prod_…`) into env:

- `POLAR_BLUEPRINT_PRODUCT_ID`
- `POLAR_PRO_PRODUCT_ID`
- `POLAR_TEAM_PRODUCT_ID`

Use sandbox product IDs in `.env.local` with `POLAR_SERVER_DEV=sandbox`. On Vercel set `POLAR_SERVER_PROD=production` and production product IDs.

Checkout metadata (set automatically by `/api/polar/checkout`): `clerk_id`, `plan` (`blueprint` | `pro` | `team`). Customer `externalCustomerId` is the Clerk user id.

## Webhooks

| Environment | URL |
|-------------|-----|
| Production | `https://archivolt.dev/api/polar/webhook` |
| Local | `https://<ngrok-host>/api/polar/webhook` |

Subscribe at minimum: `checkout.updated`, `order.paid`, `subscription.created`, `subscription.updated`, `subscription.active`, `subscription.canceled`, `subscription.revoked`.

Set `POLAR_WEBHOOK_SECRET_DEV` (local) and `POLAR_WEBHOOK_SECRET_PROD` (Vercel).

## Access tokens

Organization access token from Polar → Settings → Developers.

- Local: `POLAR_ACCESS_TOKEN_DEV` + `POLAR_SERVER_DEV=sandbox`
- Vercel: `POLAR_ACCESS_TOKEN_PROD` + `POLAR_SERVER_PROD=production`

## Vercel (production)

| Variable | Value |
|----------|--------|
| `POLAR_SERVER_PROD` | `production` |
| `POLAR_ACCESS_TOKEN_PROD` | Live org token |
| `POLAR_WEBHOOK_SECRET_PROD` | Live webhook signing secret |
| `POLAR_*_PRODUCT_ID` | Live `prod_…` ids |

## Database

Migration `003_polar_billing.sql` adds `polar_subscription_id`, `polar_customer_id` and drops `paddle_*`. Applied to **archivolt-prod** via Supabase; run the same SQL on any other project that still has Paddle columns.

## E2E verification

1. **MCP:** In Cursor, connect Polar Sandbox MCP and confirm products exist (or create them).
2. **Local:** `POLAR_SERVER_DEV=sandbox`, `POLAR_ACCESS_TOKEN_DEV`, sandbox product IDs, `POLAR_WEBHOOK_SECRET_DEV`. `ngrok http 3000` → register webhook URL.
3. **Checkout:** Sign in → landing pricing or dashboard upgrade → Blueprint → complete sandbox payment → `users.plan` = `blueprint` after webhook.
4. **Pro cancel:** Subscribe to Pro → sidebar **Cancel subscription** → `subscription_status` = `scheduled_cancellation`, `subscription_cancels_at` set → after period end webhook, plan reverts per sync logic.
5. **Production:** Deploy with live env → smoke checkout on `https://archivolt.dev`.
6. **Code:** `rg -i paddle architectai` should only hit historical migration filenames.
