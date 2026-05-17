"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import type { UserPlan } from "@/lib/plan-gate";
import { nextUpgradePlan } from "@/lib/plans";
import { startCheckout } from "@/lib/billing/checkout";

export function TechStackUpgrade({ userPlan }: { userPlan: UserPlan }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const upgradePlan = nextUpgradePlan(userPlan) ?? "pro";

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const url = await startCheckout(upgradePlan);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative p-6">
        <div
          className="pointer-events-none max-h-80 space-y-3 overflow-hidden blur-sm select-none opacity-50"
          aria-hidden
        >
          {["Database", "Auth", "Cache", "Deploy"].map((layer) => (
            <div key={layer} className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-sm font-semibold text-foreground">{layer}</p>
              <p className="mt-1 text-xs text-muted-foreground">Recommended library + install command</p>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/60 px-6 text-center backdrop-blur-[2px]">
          <div className="flex size-12 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
            <Lock className="size-5 text-cyan-400" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Tech Stack analysis locked</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Upgrade to Pro for layer-by-layer recommendations, install commands, and per-axis adapter
              libraries tailored to your architecture.
            </p>
          </div>
          <Button
            type="button"
            disabled={loading}
            className="bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
            onClick={() => void handleCheckout()}
          >
            {loading ? "Redirecting…" : "Upgrade to Pro"}
          </Button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
