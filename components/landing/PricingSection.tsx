"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { pricingTiersForDisplay, type CheckoutPlan } from "@/lib/plans"
import { startCheckout } from "@/lib/billing/checkout"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { toast } from "sonner"

type PricingSectionProps = {
  className?: string
  id?: string
}

export function PricingSection({ className, id = "pricing" }: PricingSectionProps) {
  const router = useRouter()
  const [checkoutLoading, setCheckoutLoading] = useState<CheckoutPlan | null>(null)

  async function handleCheckout(plan: CheckoutPlan) {
    setCheckoutLoading(plan)
    try {
      const url = await startCheckout(plan)
      window.location.href = url
    } catch (e) {
      const message = e instanceof Error ? e.message : "Checkout failed"
      if (message.toLowerCase().includes("unauthorized")) {
        router.push("/sign-up")
        return
      }
      toast.error(message)
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <section id={id} className={cn("border-t border-border px-4 py-24 sm:px-6", className)}>
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-500">Plans</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Pay once to ship an MVP, or subscribe when architecture is ongoing work.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {pricingTiersForDisplay().map((tier, index) => (
            <ScrollReveal
              key={tier.id}
              delay={index * 70}
              className={cn(
                "landing-pricing-card relative flex h-full flex-col rounded-xl border bg-card p-6 shadow-lg shadow-black/10",
                tier.highlighted
                  ? "border-cyan-500 ring-1 ring-cyan-500/30 md:scale-[1.02]"
                  : "border-border",
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
                <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-2 min-h-[40px] text-sm text-muted-foreground">{tier.description}</p>
                <p className="mt-6 text-4xl font-bold text-foreground">
                  {tier.price}
                  {tier.priceSuffix ? (
                    <span className="text-base font-normal text-muted-foreground">{tier.priceSuffix}</span>
                  ) : null}
                </p>
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
                {tier.checkoutPlan ? (
                  <Button
                    type="button"
                    variant={tier.highlighted ? "default" : "outline"}
                    disabled={checkoutLoading !== null}
                    className={cn(
                      "w-full rounded-lg font-semibold",
                      tier.highlighted && "bg-cyan-500 text-black hover:bg-cyan-400",
                    )}
                    onClick={() => void handleCheckout(tier.checkoutPlan!)}
                  >
                    {checkoutLoading === tier.checkoutPlan ? "Redirecting…" : tier.cta}
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
    </section>
  )
}
