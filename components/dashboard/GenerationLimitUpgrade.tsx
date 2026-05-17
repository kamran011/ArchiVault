"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserPlan } from "@/lib/plan-gate";
import type { CheckoutPlan, GenerationLimitUi } from "@/lib/plans";
import { nextUpgradePlan } from "@/lib/plans";
import { PricingCtaLink } from "@/components/shared/PricingCtaLink";
import { startCheckout } from "@/lib/billing/checkout";
import { DevTestCheckoutButton } from "@/components/billing/DevTestCheckoutButton";

type GenerationLimitUpgradeProps = {
  userPlan: UserPlan;
  limitUi: GenerationLimitUi;
};

function limitTitle(plan: UserPlan): string {
  if (plan === "free") return "Free generation used";
  if (plan === "blueprint") return "Blueprint pack complete";
  return "Generation limit reached";
}

function SystemBriefBlurPreview() {
  const fieldClass = "border border-border bg-muted/50 rounded-md h-9";
  return (
    <div
      className="pointer-events-none max-h-64 space-y-4 overflow-hidden blur-sm select-none opacity-50"
      aria-hidden
    >
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground/90">Describe the system you want to build</Label>
        <div className={cn("h-24 w-full rounded-md", fieldClass)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {["Tech stack", "Expected scale", "Industry"].map((label) => (
          <div key={label} className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </Label>
            <div className={cn("w-full", fieldClass)} />
          </div>
        ))}
      </div>
      <div className="h-11 w-60 rounded-lg bg-cyan-500/40" />
    </div>
  );
}

type CheckoutButtonProps = {
  plan: CheckoutPlan;
  label: string;
  sublabel?: string;
  variant?: "primary" | "secondary";
  loading: CheckoutPlan | null;
  disabled: boolean;
  onCheckout: (plan: CheckoutPlan) => void;
};

function CheckoutButton({
  plan,
  label,
  sublabel,
  variant = "primary",
  loading,
  disabled,
  onCheckout,
}: CheckoutButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <Button
      type="button"
      variant={isPrimary ? "default" : "secondary"}
      disabled={disabled}
      className={cn(
        "h-auto w-full min-w-[10rem] flex-col gap-0.5 py-3 sm:w-auto",
        isPrimary
          ? "bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
          : "border border-border bg-zinc-900 font-semibold text-foreground hover:bg-zinc-800",
      )}
      onClick={() => onCheckout(plan)}
    >
      <span>{loading === plan ? "Redirecting…" : label}</span>
      {sublabel ? (
        <span
          className={cn(
            "text-xs font-normal",
            isPrimary ? "text-black/75" : "text-muted-foreground",
          )}
        >
          {sublabel}
        </span>
      ) : null}
    </Button>
  );
}

export function GenerationLimitUpgrade({ userPlan, limitUi }: GenerationLimitUpgradeProps) {
  const [loading, setLoading] = React.useState<CheckoutPlan | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onCheckout(plan: CheckoutPlan) {
    setError(null);
    setLoading(plan);
    try {
      const url = await startCheckout(plan);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  const upgradePlan = nextUpgradePlan(userPlan);
  const isFree = userPlan === "free";
  const isBlueprint = userPlan === "blueprint";
  const busy = loading !== null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/20">
      <div className="relative min-h-[20rem] p-5 sm:min-h-[22rem] sm:p-6">
        <SystemBriefBlurPreview />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 px-6 py-8 sm:py-10 text-center backdrop-blur-[2px]"
          role="status"
          aria-labelledby="generation-limit-title"
          aria-describedby="generation-limit-desc"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
            <Lock className="size-5 text-cyan-400" aria-hidden />
          </div>
          <div className="max-w-md space-y-2">
            <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
              {limitUi.usageHint}
            </span>
            <h3 id="generation-limit-title" className="text-xl font-semibold tracking-tight text-foreground">
              {limitTitle(userPlan)}
            </h3>
            <p id="generation-limit-desc" className="text-sm leading-relaxed text-muted-foreground">
              {limitUi.detail}
            </p>
          </div>
          {error ? (
            <p className="max-w-sm text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {isFree ? (
              <>
                <CheckoutButton
                  plan="blueprint"
                  label="Upgrade to Blueprint"
                  sublabel="$49 one-time · 4 generations"
                  loading={loading}
                  disabled={busy}
                  onCheckout={onCheckout}
                />
                <CheckoutButton
                  plan="pro"
                  label="Upgrade to Pro"
                  sublabel="$29/mo · unlimited"
                  variant="secondary"
                  loading={loading}
                  disabled={busy}
                  onCheckout={onCheckout}
                />
              </>
            ) : isBlueprint ? (
              <>
                <CheckoutButton
                  plan="pro"
                  label="Upgrade to Pro"
                  sublabel="$29/mo · unlimited"
                  loading={loading}
                  disabled={busy}
                  onCheckout={onCheckout}
                />
                <CheckoutButton
                  plan="blueprint"
                  label="Buy more Blueprint"
                  sublabel="$49 one-time · 4 more"
                  variant="secondary"
                  loading={loading}
                  disabled={busy}
                  onCheckout={onCheckout}
                />
              </>
            ) : upgradePlan ? (
              <CheckoutButton
                plan={upgradePlan}
                label={limitUi.ctaLabel}
                loading={loading}
                disabled={busy}
                onCheckout={onCheckout}
              />
            ) : (
              <PricingCtaLink
                href={limitUi.ctaHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-cyan-500 font-semibold text-black hover:bg-cyan-400",
                )}
              >
                {limitUi.ctaLabel}
              </PricingCtaLink>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            <PricingCtaLink
              href="/pricing"
              className="text-sm font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline"
            >
              Compare all plans
            </PricingCtaLink>
            <DevTestCheckoutButton variant="outline" />
          </div>
        </div>
      </div>
    </div>
  );
}
