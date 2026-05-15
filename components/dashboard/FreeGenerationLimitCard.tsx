"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CheckoutPlan } from "@/lib/plans";

type FreeGenerationLimitCardProps = {
  planLabel: string;
  usageHint: string;
};

export function FreeGenerationLimitCard({ planLabel, usageHint }: FreeGenerationLimitCardProps) {
  const [loading, setLoading] = React.useState<CheckoutPlan | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function startCheckout(plan: CheckoutPlan) {
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

  const heading = `${planLabel} plan · ${usageHint}`;

  return (
    <div className="flex w-full justify-center py-2">
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl shadow-black/25",
          "ring-1 ring-white/5",
        )}
      >
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {heading}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Upgrade to create more architectures
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div
            className={cn(
              "flex flex-1 flex-col rounded-xl border p-4 text-left",
              "border-cyan-500/40 bg-cyan-500/[0.06] ring-1 ring-cyan-500/20",
            )}
          >
            <Button
              type="button"
              disabled={loading !== null}
              className="h-auto w-full flex-col gap-1 rounded-lg bg-cyan-500 py-3.5 font-semibold text-black hover:bg-cyan-400"
              onClick={() => void startCheckout("blueprint")}
            >
              <span>{loading === "blueprint" ? "Redirecting…" : "Upgrade to Blueprint"}</span>
              <span className="text-xs font-normal text-black/80">$49 one-time · 4 generations</span>
            </Button>
          </div>

          <div className="flex flex-1 flex-col rounded-xl border border-border bg-muted/30 p-4 text-left">
            <Button
              type="button"
              variant="secondary"
              disabled={loading !== null}
              className="h-auto w-full flex-col gap-1 rounded-lg border border-border bg-zinc-900 py-3.5 font-semibold text-foreground hover:bg-zinc-800"
              onClick={() => void startCheckout("pro")}
            >
              <span>{loading === "pro" ? "Redirecting…" : "Upgrade to Pro"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                $29/mo · unlimited
              </span>
            </Button>
          </div>
        </div>

        {error ? <p className="mt-4 text-center text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
