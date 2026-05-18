"use client"

import Link from "next/link"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

const VOLATILITY_AXES = [
  {
    name: "IVideoHost",
    reason: "Vimeo → Cloudflare Stream or Mux",
    ship: "VimeoAdapter",
  },
  {
    name: "IPaymentProcessor",
    reason: "Stripe today, SEPA for EU expansion",
    ship: "StripeAdapter",
  },
  {
    name: "INotificationSender",
    reason: "Email → WhatsApp + in-app push",
    ship: "SendGridEmailAdapter",
  },
  {
    name: "ICalendarProvider",
    reason: "Calendly → in-house booking engine",
    ship: "CalendlyAdapter",
  },
  {
    name: "IStorageBackend",
    reason: "AWS S3 → Cloudflare R2 (zero egress)",
    ship: "S3Adapter",
  },
  {
    name: "IIdentityProvider",
    reason: "Email/password → Google SSO → SAML",
    ship: "NextAuthAdapter",
  },
] as const

export function ExampleOutputSection() {
  return (
    <section id="example" className="scroll-mt-24 border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Example output</p>
          <h2 className="mb-4 text-3xl font-bold text-foreground">FitCoach SaaS Platform</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            A multi-tenant platform for fitness coaches. Described in plain English → full VBD blueprint generated in
            60 seconds.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={60} className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="landing-card-hover flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Future-proof score</p>
            <p className="text-5xl font-bold text-cyan-400" aria-label="Future-proof score value">
              87
            </p>
            <p className="mt-2 text-xs text-muted-foreground">out of 100</p>
          </div>

          <div className="landing-card-hover rounded-xl border border-border bg-card p-6 md:col-span-2">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Executive summary</p>
            <p className="text-sm leading-relaxed text-foreground/90">
              A multi-tenant SaaS platform for fitness coaches built with Volatility-Based Decomposition, isolating each
              likely-to-change axis (video hosting, payments, notifications, calendar, storage) behind stable interfaces.
              Core orchestration services remain untouched as third-party providers are swapped or added.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
            10 volatility axes identified
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {VOLATILITY_AXES.map((axis, index) => (
              <ScrollReveal
                key={axis.name}
                delay={index * 40}
                className="landing-card-hover rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400">{axis.name}</span>
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    {axis.ship}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{axis.reason}</p>
              </ScrollReveal>
            ))}
          </div>
          <p className="mt-3 mb-4 text-xs text-muted-foreground/70">
            + 4 more axes: IDocumentGenerator, ISchedulingEngine, IComplianceEngine, IFeatureFlagService
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80} className="text-center">
          <p className="mb-8 text-sm text-muted-foreground">
            This blueprint was generated in 68 seconds from a plain-English description.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="landing-cta landing-cta-primary inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-black hover:bg-cyan-400"
            >
              Generate free blueprint
            </Link>
            <Link
              href="/try"
              className="landing-cta landing-cta-secondary inline-flex rounded-xl border border-border px-6 py-3.5 text-base text-foreground/80 hover:border-zinc-500"
            >
              Try as guest
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
