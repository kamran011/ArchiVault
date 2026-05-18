"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

type StatsPayload = {
  memberCount: number
  visitorCount: number
  headline: string
}

export function SocialProofSection({ className }: { className?: string }) {
  const [stats, setStats] = React.useState<StatsPayload | null>(null)

  React.useEffect(() => {
    void fetch("/api/public/stats")
      .then((r) => r.json())
      .then((body) => setStats(body as StatsPayload))
      .catch(() => setStats(null))
  }, [])

  const headline = stats?.headline ?? "Architects exploring Archivolt"

  return (
    <section className={className} aria-label="Community">
      <ScrollReveal>
        <div className="mx-auto max-w-3xl rounded-xl border border-border/80 bg-muted/20 px-6 py-5 text-center">
          <p className="text-sm font-medium text-foreground sm:text-base">{headline}</p>
        </div>
      </ScrollReveal>
    </section>
  )
}
