"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { PRICING_TIERS, type CheckoutPlan } from "@/lib/plans"
import { PRICING_LAUNCH_BANNER } from "@/lib/waitlist"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { WaitlistModal } from "@/components/landing/WaitlistModal"

type PricingSectionProps = {
  className?: string
  id?: string
}

export function PricingSection({ className, id = "pricing" }: PricingSectionProps) {
  const [waitlistPlan, setWaitlistPlan] = useState<CheckoutPlan | null>(null)
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  function openWaitlist(plan: CheckoutPlan) {
    setWaitlistPlan(plan)
    setWaitlistOpen(true)
  }

  return (
    <section id={id} className={cn("border-t border-border px-4 py-24 sm:px-6", className)}>
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-500">Plans</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Pay once to ship an MVP, or subscribe when architecture is ongoing work.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={40} className="mb-12">
          <div
            className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-center text-sm text-foreground sm:px-6 sm:text-base"
            role="status"
          >
            {PRICING_LAUNCH_BANNER}
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PRICING_TIERS.map((tier, index) => (
            <ScrollReveal
              key={tier.id}
              delay={index * 70}
              className={cn(
                "landing-pricing-card relative flex h-full flex-col rounded-xl border bg-card p-6 shadow-lg shadow-black/10",
                tier.highlighted
                  ? "border-cyan-500 ring-1 ring-cyan-500/30 md:scale-[1.02]"
                  : "border-border",
                tier.comingSoon && "opacity-[0.98]",
              )}
            >
              {tier.badge ? (
                <div
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black",
                    tier.badge === "MOST POPULAR" && "animate-popular-badge",
                  )}
                >
                  {tier.badge}
                </div>
              ) : null}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
                  {tier.statusBadge ? (
                    <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                      {tier.statusBadge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 min-h-[40px] text-sm text-muted-foreground">{tier.description}</p>
                <p className="mt-6 text-4xl font-bold text-foreground">
                  {tier.price}
                  {tier.priceSuffix ? (
                    <span className="text-base font-normal text-muted-foreground">{tier.priceSuffix}</span>
                  ) : null}
                </p>
                {tier.launchSubtext ? (
                  <p className="mt-2 text-xs text-muted-foreground">{tier.launchSubtext}</p>
                ) : null}
              </div>

              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-foreground/85">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-cyan-500" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {tier.comingSoon && tier.checkoutPlan ? (
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full rounded-lg font-semibold",
                      tier.highlighted &&
                        "border-cyan-500/40 bg-cyan-500/10 text-foreground hover:bg-cyan-500/20",
                    )}
                    onClick={() => openWaitlist(tier.checkoutPlan!)}
                  >
                    {tier.cta}
                  </Button>
                ) : tier.href ? (
                  <Link
                    href={tier.href}
                    className={cn(
                      buttonVariants({ variant: tier.highlighted ? "default" : "outline" }),
                      "inline-flex w-full justify-center rounded-lg font-semibold",
                      tier.highlighted && "bg-cyan-500 text-black hover:bg-cyan-400",
                    )}
                  >
                    {tier.cta}
                  </Link>
                ) : null}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <WaitlistModal
        open={waitlistOpen}
        plan={waitlistPlan}
        onOpenChange={(open) => {
          setWaitlistOpen(open)
          if (!open) setWaitlistPlan(null)
        }}
      />
    </section>
  )
}
