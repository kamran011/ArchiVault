import "server-only"

import { Resend } from "resend"
import type { CheckoutPlan } from "@/lib/plans"
import { WAITLIST_LAUNCH_DAYS } from "@/lib/waitlist"

const PLAN_LABELS: Record<CheckoutPlan, string> = {
  blueprint: "Blueprint",
  pro: "Pro",
  team: "Team",
}

function waitlistEmailContent(plan: CheckoutPlan) {
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
    "https://archivolt.dev",
  ].join("\n")

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #e4e4e7; background: #0a0a0a; padding: 32px;">
      <div style="max-width: 480px; margin: 0 auto; border: 1px solid #27272a; border-radius: 12px; padding: 28px; background: #18181b;">
        <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #22d3ee;">Archivolt</p>
        <h1 style="margin: 0 0 16px; font-size: 22px; color: #fafafa;">You're on the early-bird list</h1>
        <p style="margin: 0 0 12px; color: #a1a1aa;">Thanks for joining the waitlist for <strong style="color: #fafafa;">${planLabel}</strong>.</p>
        <p style="margin: 0 0 20px; color: #a1a1aa;">${launchLine} We'll email you when paid tiers go live so you can claim early-bird access.</p>
        <p style="margin: 0; font-size: 13px; color: #71717a;">
          <a href="https://archivolt.dev" style="color: #22d3ee;">archivolt.dev</a>
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
  // Replies go here (e.g. Cloudflare Email Routing → your Gmail inbox)
  const replyTo = process.env.RESEND_REPLY_TO?.trim() ?? "support@archivolt.dev"
  const { subject, text, html } = waitlistEmailContent(plan)
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject,
    text,
    html,
  })

  if (error) {
    console.error("[waitlist] Resend send failed:", error)
    return { ok: false, error: error.message ?? "Failed to send confirmation email" }
  }

  return { ok: true }
}
