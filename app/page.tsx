"use client"

import Link from "next/link"
import { AuthNav } from "@/components/shared/AuthNav"
import { BrandWordmark } from "@/components/brand/BrandWordmark"
import { ExampleOutputSection } from "@/components/landing/ExampleOutputSection"
import { HeroDemoPreview } from "@/components/landing/HeroDemoPreview"
import { ItsThatSimpleSection } from "@/components/landing/ItsThatSimpleSection"
import { WhoIsArchivoltForSection } from "@/components/landing/WhoIsArchivoltForSection"
import { FaqSection } from "@/components/landing/FaqSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { ScrollPricingIntoViewOnMount } from "@/components/shared/PricingCtaLink"
import { SiteFooter } from "@/components/shared/SiteFooter"
import { siteContainerClass, siteGutterClass } from "@/lib/site-layout"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <div className="landing-surface min-h-screen text-foreground">
      <ScrollPricingIntoViewOnMount />
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className={siteGutterClass}>
          <div className={cn(siteContainerClass, "flex h-16 items-center justify-between")}>
            <BrandWordmark textClassName="text-lg" logoSize={28} />
            <AuthNav variant="landing" />
          </div>
        </div>
      </nav>

      <section className="px-6 pb-16 pt-32">
        <div className="mx-auto max-w-4xl animate-fade-in-up text-center motion-reduce:animate-none">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            <span className="text-purple-400">{"\u2726"}</span>
            <span>Powered by Claude {"\u00b7"} VBD methodology</span>
          </div>
          <h1 className="hero-title mb-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Design systems that survive requirement changes
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-lg text-foreground/90 sm:text-xl">
            Get a VBD architecture blueprint in 60 seconds.{" "}
            <span className="text-muted-foreground">No credit card.</span>
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground">
            Volatility-Based Decomposition decomposes systems based on what changes, not what exists.{" "}
            So you swap
            providers without rewriting core logic.
          </p>

          <div className="mb-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/sign-up"
              className="landing-cta landing-cta-primary landing-cta-hero rounded-xl bg-cyan-500 px-10 py-4 text-lg font-bold text-black shadow-lg shadow-cyan-500/30 hover:bg-cyan-400"
            >
              Generate free blueprint
            </Link>
            <Link
              href="/try"
              className="landing-cta landing-cta-secondary rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-8 py-4 text-base font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/15"
            >
              Try as guest
            </Link>
          </div>
          <p className="mb-10 text-sm text-muted-foreground/70">
            No credit card required {"\u00b7"} One free blueprint as guest or after sign-up
          </p>

          <HeroDemoPreview />
        </div>
      </section>

      <WhoIsArchivoltForSection />

      <section className="border-t border-border/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold">How Archivolt works</h2>
          <p className="mb-16 text-center text-muted-foreground">Three steps from prose to governed interfaces</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Describe your system",
                desc: "Tell us what your system does: who uses it, what services it connects to, and what can\u2019t change. Plain English only.",
              },
              {
                num: "02",
                title: "Isolate volatility axes",
                desc: "Claude hunts for what WILL change independently \u2014 payment providers, notification channels, storage backends \u2014 behind stable adapter contracts.",
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

      <ItsThatSimpleSection />

      <ExampleOutputSection />

      <PricingSection className="border-border/50" />
      <FaqSection />
      <SiteFooter />
    </div>
  )
}

