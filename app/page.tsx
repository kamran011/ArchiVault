"use client"

import Link from "next/link"
import { AuthNav } from "@/components/shared/AuthNav"
import { BrandWordmark } from "@/components/brand/BrandWordmark"
import { ExampleOutputSection } from "@/components/landing/ExampleOutputSection"
import { HeroDemoPreview } from "@/components/landing/HeroDemoPreview"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { ItsThatSimpleSection } from "@/components/landing/ItsThatSimpleSection"
import { CredibilitySection } from "@/components/landing/CredibilitySection"
import { WhoIsArchivoltForSection } from "@/components/landing/WhoIsArchivoltForSection"
import { FaqSection } from "@/components/landing/FaqSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { ScrollPricingIntoViewOnMount } from "@/components/shared/PricingCtaLink"
import { SiteFooter } from "@/components/shared/SiteFooter"
import { SocialProofSection } from "@/components/landing/SocialProofSection"
import { siteContainerClass, siteGutterClass } from "@/lib/site-layout"
import { cn } from "@/lib/utils"
import { telemetry } from "@/lib/telemetry"

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
        <div className="mx-auto max-w-5xl animate-fade-in-up text-center motion-reduce:animate-none">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            <span className="text-purple-400">{"\u2726"}</span>
            <span>Powered by Claude {"\u00b7"} VBD methodology</span>
          </div>
          <h1 className="hero-title mb-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block text-foreground">Design systems that survive requirement changes</span>
            <span className="mt-2 block bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              AI-powered in 60 seconds.
            </span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Volatility-Based Decomposition puts what will change behind adapters, so you swap providers without
            rewriting core logic.
          </p>

          <HeroDemoPreview className="mb-8" />

          <div className="mb-6 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Link
              href="/sign-up"
              onClick={() => telemetry("cta_hero_signup")}
              className="landing-cta landing-cta-primary landing-cta-hero w-full rounded-xl bg-cyan-500 px-10 py-5 text-lg font-bold text-black shadow-xl shadow-cyan-500/35 hover:bg-cyan-400 sm:w-auto"
            >
              Generate free blueprint
            </Link>
            <Link
              href="/try"
              onClick={() => telemetry("cta_hero_guest")}
              className="landing-cta landing-cta-secondary w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/15 sm:w-auto"
            >
              Try as guest
            </Link>
            <button
              type="button"
              onClick={() => {
                telemetry("cta_hero_learn_more")
                document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="landing-cta w-full rounded-xl border border-border px-6 py-3 text-sm text-muted-foreground transition-colors hover:border-zinc-500 hover:text-foreground sm:w-auto"
            >
              Learn more
            </button>
          </div>
          <p className="mb-8 text-sm text-muted-foreground/70">
            No credit card required {"\u00b7"} One free blueprint as guest or after sign-up
          </p>

          <SocialProofSection className="mb-2 px-0" />
        </div>
      </section>

      <WhoIsArchivoltForSection />

      <CredibilitySection />

      <HowItWorks />

      <ItsThatSimpleSection />

      <ExampleOutputSection />

      <PricingSection className="border-border/50" />
      <FaqSection />
      <SiteFooter />
    </div>
  )
}

