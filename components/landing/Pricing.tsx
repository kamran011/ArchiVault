"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Try the full VBD analysis once.",
    features: ["1 architecture generation", "Mermaid + volatility map", "Scaffold prompt preview (Pro unlocks full prompt)"],
    plan: null as "pro" | "team" | null,
    cta: "Start free",
    href: "/sign-up",
  },
  {
    name: "Pro",
    price: "$29",
    description: "For builders shipping multiple products.",
    features: ["Unlimited generations", "PDF export + history", "Scaffold prompt for Cursor / Claude Code"],
    plan: "pro" as const,
    cta: "Upgrade to Pro",
    href: null,
  },
  {
    name: "Team",
    price: "$79",
    description: "For design reviews and shared standards.",
    features: ["Everything in Pro", "Team sharing", "Priority support"],
    plan: "team" as const,
    cta: "Upgrade to Team",
    href: null,
  },
];

export function Pricing() {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState<"pro" | "team" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: "pro" | "team") {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="border-t border-zinc-800 bg-[#0a0a0a] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-400">Plans</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Pricing</h2>
          <p className="mt-4 text-lg text-zinc-400">Start free, scale when architecture reviews become daily work.</p>
          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        </div>
        <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-xl border bg-zinc-900 p-6 shadow-lg shadow-black/25",
                tier.name === "Pro"
                  ? "border-cyan-500 bg-cyan-950/20 shadow-cyan-500/10 md:scale-[1.02]"
                  : "border-zinc-800",
              )}
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{tier.description}</p>
                <p className="mt-6 text-4xl font-bold text-white">
                  {tier.price}
                  {tier.price !== "$0" ? <span className="text-lg font-normal text-zinc-500">/mo</span> : null}
                </p>
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-zinc-300">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-cyan-400" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {tier.plan && isSignedIn ? (
                  <Button
                    className={cn(
                      "w-full rounded-lg font-semibold",
                      tier.name === "Pro"
                        ? "bg-cyan-500 text-black hover:bg-cyan-400"
                        : "bg-zinc-800 text-white hover:bg-zinc-700",
                    )}
                    disabled={loading === tier.plan}
                    onClick={() => void startCheckout(tier.plan!)}
                  >
                    {loading === tier.plan ? "Redirecting…" : tier.cta}
                  </Button>
                ) : tier.plan ? (
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full rounded-lg border-zinc-700 text-zinc-100 hover:bg-zinc-800",
                      )}
                    >
                      Sign in to upgrade
                    </button>
                  </SignInButton>
                ) : (
                  <a
                    href={tier.href!}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "inline-flex w-full justify-center rounded-lg bg-cyan-500 font-semibold text-black hover:bg-cyan-400",
                    )}
                  >
                    {tier.cta}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
