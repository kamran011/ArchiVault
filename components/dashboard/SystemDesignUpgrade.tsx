"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  accentHighlightClass,
  sdPriorityBadgeClass,
} from "@/lib/theme-badges";
import { PricingCtaLink } from "@/components/shared/PricingCtaLink";
import { startCheckout } from "@/lib/billing/checkout";

function PatternBlurPreview() {
  return (
    <div
      className="pointer-events-none max-h-80 space-y-3 overflow-hidden blur-sm select-none opacity-50"
      aria-hidden
    >
      <div className="rounded-xl border border-border bg-muted/50 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className={cn("font-mono text-sm font-bold", accentHighlightClass)}>IPaymentProcessor</span>
          <span className={cn("rounded-full border px-2 py-0.5 text-xs", sdPriorityBadgeClass.mandatory)}>
            MANDATORY
          </span>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg bg-muted p-3">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Circuit Breaker</p>
            <p className="text-xs text-muted-foreground">
              Stripe outages are inevitable. Without a circuit breaker...
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Idempotency</p>
            <p className="text-xs text-muted-foreground">
              Payment retries must never double-charge customers...
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-muted/50 p-5">
        <div className="mb-2 h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

export function SystemDesignUpgrade() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onCheckout() {
    setError(null);
    setLoading(true);
    try {
      const url = await startCheckout("team");
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/20">
      <div className="relative min-h-[20rem] p-5 sm:min-h-[22rem] sm:p-6">
        <PatternBlurPreview />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 px-6 py-8 text-center backdrop-blur-[2px] sm:py-10"
          role="status"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
            <Lock className="size-5 text-cyan-400" aria-hidden />
          </div>
          <div className="max-w-md space-y-2">
            <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
              Team feature
            </span>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              System Design is a Team feature
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Get pattern-by-pattern recommendations for your architecture — circuit breakers, message
              queues, caching strategies, and more. Based on 50 proven system design patterns.
            </p>
          </div>
          {error ? (
            <p className="max-w-sm text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={loading}
            className="min-w-[12rem] bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
            onClick={() => void onCheckout()}
          >
            {loading ? "Redirecting…" : "Upgrade to Team — $49/mo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
