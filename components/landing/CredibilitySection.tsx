"use client"

import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { cn } from "@/lib/utils"

const RIGHTING_SOFTWARE_URL = "https://www.rightingsoftware.org/"

export function CredibilitySection({ className }: { className?: string }) {
  return (
    <section
      className={cn("border-t border-border/50 px-6 py-20", className)}
      aria-labelledby="credibility-heading"
    >
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <p id="credibility-heading" className="mb-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Grounded in proven methodology
          </p>
          <blockquote className="mb-8 border-l-4 border-cyan-500/60 pl-6 text-left">
            <p className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
              &ldquo;Decompose based on volatility.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">
              &mdash; Juval L&ouml;wy,{" "}
              <cite className="font-medium not-italic text-foreground/80">Righting Software</cite>
            </footer>
          </blockquote>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="space-y-4 text-center text-base leading-relaxed text-muted-foreground sm:text-left">
            <p>
              Any change is potentially dangerous &mdash; volatile requirements can feel like a hand grenade in your
              codebase. With volatility-based decomposition, you encapsulate that change: whatever happens inside the
              vault doesn&apos;t affect the rest of your system.
            </p>
            <p className="text-foreground/90">
              That&apos;s what Archivolt automates &mdash; turning L&ouml;wy&apos;s methodology into a practical blueprint
              you can ship from a plain-English description.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} className="mt-8 text-center sm:text-left">
          <a
            href={RIGHTING_SOFTWARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
          >
            Learn more about VBD
            <span className="sr-only"> (opens Righting Software in a new tab)</span>
            <span aria-hidden className="text-xs">
              ↗
            </span>
          </a>
        </ScrollReveal>
      </div>
    </section>
  )
}
