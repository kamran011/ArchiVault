import "server-only"

import { readFileSync } from "fs"
import { resolve } from "path"
import { Resend } from "resend"
import type { Attachment } from "resend"
import type { CheckoutPlan } from "@/lib/plans"
import { WAITLIST_LAUNCH_DAYS } from "@/lib/waitlist"

const PLAN_LABELS: Record<CheckoutPlan, string> = {
  blueprint: "Blueprint",
  pro: "Pro",
  team: "Team",
  test: "Test checkout",
}

const PRODUCTION_URL = "https://archivolt.dev"
const LOGO_CID = "archivolt-logo"

/** Public URL for links in email body (footer, etc.). */
function emailAppUrl(): string {
  const raw = (
    process.env.RESEND_EMAIL_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    PRODUCTION_URL
  ).replace(/\/$/, "")
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)) return PRODUCTION_URL
  return raw
}

/** Remote logo URL fallback when inline file is missing. */
function emailLogoUrl(): string {
  const explicit = process.env.RESEND_EMAIL_LOGO_URL?.trim()
  if (explicit) return explicit
  return `${emailAppUrl()}/icon.png`
}

function loadInlineLogo(): { src: string; attachment: Attachment } | null {
  const paths = [
    resolve(process.cwd(), "public/icon.png"),
    resolve(process.cwd(), "app/icon.png"),
  ]
  for (const filePath of paths) {
    try {
      const content = readFileSync(filePath)
      return {
        src: `cid:${LOGO_CID}`,
        attachment: {
          filename: "archivolt-icon.png",
          content,
          contentType: "image/png",
          contentId: LOGO_CID,
        },
      }
    } catch {
      /* try next path */
    }
  }
  return null
}

function waitlistEmailContent(plan: CheckoutPlan, logoSrc: string) {
  const appUrl = emailAppUrl()
  const planLabel = PLAN_LABELS[plan]
  const launchLine = `${planLabel} launches in ${WAITLIST_LAUNCH_DAYS} days.`

  const text = [
    "You're on the Archivolt early-bird list.",
    "",
    `Plan: ${planLabel}`,
    launchLine,
    "",
    "We'll email you again when paid tiers go live with early-bird access.",
    "",
    "— Archivolt",
    appUrl,
  ].join("\n")

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #e4e4e7; background: #0a0a0a; padding: 32px;">
      <div style="max-width: 480px; margin: 0 auto; border: 1px solid #27272a; border-radius: 12px; padding: 28px; background: #18181b;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 16px;">
          <tr>
            <td style="vertical-align: middle; padding-right: 10px;">
              <a href="${appUrl}" style="text-decoration: none;">
                <img src="${logoSrc}" width="28" height="28" alt="" style="display: block; border: 0;" />
              </a>
            </td>
            <td style="vertical-align: middle;">
              <a href="${appUrl}" style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #22d3ee; text-decoration: none;">Archivolt</a>
            </td>
          </tr>
        </table>
        <h1 style="margin: 0 0 16px; font-size: 22px; color: #fafafa;">You're on the early-bird list</h1>
        <p style="margin: 0 0 12px; color: #a1a1aa;">Thanks for joining the waitlist for <strong style="color: #fafafa;">${planLabel}</strong>.</p>
        <p style="margin: 0 0 20px; color: #a1a1aa;">${launchLine} We'll email you when paid tiers go live so you can claim early-bird access.</p>
        <p style="margin: 0; font-size: 13px; color: #71717a;">
          <a href="${appUrl}" style="color: #22d3ee;">archivolt.dev</a>
        </p>
      </div>
    </div>
  `.trim()

  return {
    subject: `You're on the ${planLabel} early-bird list — Archivolt`,
    text,
    html,
  }
}

export async function sendWaitlistConfirmationEmail(
  to: string,
  plan: CheckoutPlan,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" }
  }

  const from = process.env.RESEND_FROM?.trim() ?? "Archivolt <support@archivolt.dev>"
  const replyTo = process.env.RESEND_REPLY_TO?.trim() ?? "support@archivolt.dev"

  const inlineLogo = loadInlineLogo()
  const logoSrc = inlineLogo?.src ?? emailLogoUrl()
  const { subject, text, html } = waitlistEmailContent(plan, logoSrc)
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject,
    text,
    html,
    attachments: inlineLogo ? [inlineLogo.attachment] : undefined,
  })

  if (error) {
    console.error("[waitlist] Resend send failed:", error)
    return { ok: false, error: error.message ?? "Failed to send confirmation email" }
  }

  return { ok: true }
}
