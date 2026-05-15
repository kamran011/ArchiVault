"use client"

import Link from "next/link"
import { AuthNav } from "@/components/shared/AuthNav"
import { BrandWordmark } from "@/components/brand/BrandWordmark"
import { ExampleOutputSection } from "@/components/landing/ExampleOutputSection"
import { FaqSection } from "@/components/landing/FaqSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { SiteFooter } from "@/components/shared/SiteFooter"

export default function Home() {
  return (
    <div className="landing-surface min-h-screen text-foreground">
      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandWordmark textClassName="text-lg" logoSize={28} />
          <AuthNav variant="landing" />
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            <span className="text-purple-400">✦</span>
            <span>Powered by Claude · VBD methodology</span>
          </div>
          <h1 className="hero-title mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block text-foreground">Architect your system</span>
            <span className="block bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              for the next 10 years
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            When your client says &quot;email is so 90s, use SMS instead&quot;{"\u2014"} you change one adapter. Not your
            entire codebase.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-black transition-colors hover:bg-cyan-400"
            >
              Generate free architecture
            </Link>
            <button
              type="button"
              onClick={() =>
                document.getElementById("example")?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-xl border border-border px-8 py-3.5 text-base text-foreground/80 transition-colors hover:border-zinc-500"
            >
              See example output
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground/70">
            No credit card required {"\u00b7"} First architecture free
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-border/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold">How Archivolt works</h2>
          <p className="mb-16 text-center text-muted-foreground">Three steps from prose to governed interfaces</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Describe your system",
                desc: "Plain English beats boxes and lines. Outline actors, integrations, workflows, scale, and what must never break.",
              },
              {
                num: "02",
                title: "Isolate volatility axes",
                desc: "The AI hunts for what WILL change independently \u2014 carriers, gateways, tenants, jurisdictions \u2014 behind stable I-prefixed contracts.",
              },
              {
                num: "03",
                title: "Ship diagrams + roadmap",
                desc: "Get a Mermaid architecture map, adapter contracts, build sequencing, tech guidance, and a volatility score.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-border"
              >
                <div className="mb-4 font-mono text-sm font-bold text-cyan-400">{step.num}</div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ExampleOutputSection />

      <PricingSection className="border-border/50" />
      <FaqSection />
      <SiteFooter />
    </div>
  )
}
