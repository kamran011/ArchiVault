"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { CopyButton } from "@/components/shared/CopyButton"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { FITCOACH_DEMO } from "@/lib/demo/fitcoach-example"
import { telemetry } from "@/lib/telemetry"

const MermaidDiagram = dynamic(
  () => import("@/components/dashboard/MermaidDiagram").then((m) => m.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Loading diagram…
      </div>
    ),
  },
)

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

const demo = FITCOACH_DEMO
const adapterBlock = ["```ts", demo.adapterContract.trim(), "```"].join("\n")

export function ExampleOutputSection() {
  return (
    <section id="example" className="scroll-mt-24 border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">See what you&apos;ll get</p>
          <h2 className="mb-4 text-3xl font-bold text-foreground">{demo.systemName}</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Generated in {demo.generationSeconds} seconds. Here&apos;s what you&apos;ll get — a full VBD blueprint from
            plain English.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={40} className="mb-8 overflow-hidden rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Architecture map (Mermaid)</p>
          <div className="max-h-64 overflow-auto">
            <MermaidDiagram diagram={demo.mermaidDiagram} systemName={demo.systemName} />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={60} className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="landing-card-hover flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Future-proof score</p>
            <p className="text-5xl font-bold text-cyan-400" aria-label="Future-proof score value">
              {demo.futureProofScore}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">out of 100</p>
          </div>

          <div className="landing-card-hover rounded-xl border border-border bg-card p-6 md:col-span-2">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Executive summary</p>
            <p className="text-sm leading-relaxed text-foreground/90">{demo.summary}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} className="mb-8 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-row items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Adapter contract (sample)</p>
              <h3 className="mt-1 font-mono text-sm font-semibold text-cyan-400 sm:text-base">INotificationSender</h3>
            </div>
            <CopyButton text={adapterBlock} label="Copy sample" />
          </div>
          <pre className="max-h-56 overflow-auto p-4 font-mono text-xs leading-relaxed text-foreground/90 sm:text-sm">
            <code>{demo.adapterContract}</code>
          </pre>
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
            This blueprint was generated in {demo.generationSeconds} seconds from a plain-English description.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              onClick={() => telemetry("cta_example_signup")}
              className="landing-cta landing-cta-primary inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-black hover:bg-cyan-400"
            >
              Generate free blueprint
            </Link>
            <Link
              href="/try"
              onClick={() => telemetry("cta_example_guest")}
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
