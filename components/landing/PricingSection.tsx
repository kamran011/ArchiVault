"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Check } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { PRICING_TIERS, type CheckoutPlan } from "@/lib/plans"

type PricingSectionProps = {
  className?: string
  id?: string
}

export function PricingSection({ className, id = "pricing" }: PricingSectionProps) {
  const { isSignedIn } = useUser()
  const [loading, setLoading] = useState<CheckoutPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(plan: CheckoutPlan) {
    setError(null)
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Checkout failed")
      if (data.url) window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <section id={id} className={cn("border-t border-border px-4 py-24 sm:px-6", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-500">Plans</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Pay once to ship an MVP, or subscribe when architecture is ongoing work.
          </p>
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "relative flex flex-col rounded-xl border bg-card p-6 shadow-lg shadow-black/10",
                tier.highlighted
                  ? "border-cyan-500 ring-1 ring-cyan-500/30 md:scale-[1.02]"
                  : "border-border",
              )}
            >
              {tier.badge ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
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
                {tier.checkoutPlan && isSignedIn ? (
                  <Button
                    className={cn(
                      "w-full rounded-lg font-semibold",
                      tier.highlighted
                        ? "bg-cyan-500 text-black hover:bg-cyan-400"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                    disabled={loading === tier.checkoutPlan}
                    onClick={() => void startCheckout(tier.checkoutPlan!)}
                  >
                    {loading === tier.checkoutPlan ? "Redirecting…" : tier.cta}
                  </Button>
                ) : tier.checkoutPlan ? (
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full rounded-lg",
                      )}
                    >
                      Sign in to purchase
                    </button>
                  </SignInButton>
                ) : (
                  <Link
                    href={tier.href!}
                    className={cn(
                      buttonVariants({ variant: tier.highlighted ? "default" : "outline" }),
                      "inline-flex w-full justify-center rounded-lg font-semibold",
                      tier.highlighted && "bg-cyan-500 text-black hover:bg-cyan-400",
                    )}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
