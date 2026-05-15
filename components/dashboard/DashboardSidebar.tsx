"use client";

import * as React from "react";
import { PricingCtaLink } from "@/components/shared/PricingCtaLink";
import { UserButton, useUser } from "@clerk/nextjs";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RelativeDate } from "@/components/shared/RelativeDate";
import type { UserPlan } from "@/lib/plan-gate";
import { nextUpgradePlan, type CheckoutPlan } from "@/lib/plans";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { Skeleton } from "@/components/ui/skeleton";
import type { Architecture } from "@/types/architecture";
export type GenerationRow = {
  id: string;
  description: string;
  created_at: string;
  tech_stack?: string | null;
  result: Architecture;
};

type DashboardSidebarProps = {
  generations: GenerationRow[];
  loading: boolean;
  activeId: string | null;
  userPlan: UserPlan;
  onNew: () => void;
  onSelect: (row: GenerationRow) => void;
  onDelete: (id: string, name: string) => void;
};

function previewDescription(description: string) {
  if (description.length <= 50) return description;
  return `${description.slice(0, 50)}…`;
}

import { upgradeButtonClass } from "@/lib/theme-badges";

export function DashboardSidebar({
  generations,
  loading,
  activeId,
  userPlan,
  onNew,
  onSelect,
  onDelete,
}: DashboardSidebarProps) {
  const { user } = useUser();
  const [upgrading, setUpgrading] = React.useState(false);

  const displayName =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Account";

  async function startCheckout(plan: CheckoutPlan) {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch {
      // Checkout errors surface on retry; keep sidebar uncluttered
    } finally {
      setUpgrading(false);
    }
  }

  const upgradePlan = nextUpgradePlan(userPlan);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-sidebar-border p-4">
        <BrandWordmark logoSize={22} textClassName="text-base" className="transition-opacity hover:opacity-80" />
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={onNew}
          className="group flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground/80 transition-all hover:border-border hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4 text-muted-foreground transition-colors group-hover:text-cyan-400" aria-hidden />
          New architecture
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3" role="navigation" aria-label="Recent architectures">
        <p className="mb-1 px-2 py-2 text-xs uppercase tracking-widest text-muted-foreground/70">Recent</p>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg bg-zinc-200 ring-1 ring-zinc-300/60 dark:bg-zinc-800 dark:ring-zinc-600/50" />
            <Skeleton className="h-16 w-full rounded-lg bg-zinc-200 ring-1 ring-zinc-300/60 dark:bg-zinc-800 dark:ring-zinc-600/50" />
            <Skeleton className="h-16 w-full rounded-lg bg-zinc-200 ring-1 ring-zinc-300/60 dark:bg-zinc-800 dark:ring-zinc-600/50" />
          </div>
        ) : generations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground/70">
            No architectures yet.
            <br />
            Generate your first one!
          </p>
        ) : (
          <div className="space-y-0.5">
            {generations.map((row) => {
              const active = activeId === row.id;
              return (
                <div
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-2 rounded-lg border-l-2 px-3 py-2.5 transition-colors",
                    active
                      ? "border-cyan-500 bg-sidebar-accent"
                      : "border-transparent hover:bg-sidebar-accent",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {row.result?.systemName || "Untitled"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {previewDescription(row.description)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      <RelativeDate dateString={row.created_at} />
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete ${row.result?.systemName || "architecture"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row.id, row.result?.systemName || "Untitled");
                    }}
                    className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-zinc-700/60 hover:text-red-400 group-hover:opacity-100 dark:hover:bg-zinc-700"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-7 ring-2 ring-cyan-500/30",
                },
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground/80">{displayName}</p>
              <p className="text-xs capitalize text-muted-foreground/70">{userPlan} plan</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center">
            {upgradePlan ? (
            <button
              type="button"
              disabled={upgrading}
              onClick={() => void startCheckout(upgradePlan)}
              className={upgradeButtonClass}
            >
              {upgrading ? "…" : "Upgrade"}
            </button>
          ) : (
            <PricingCtaLink href="/#pricing" className={upgradeButtonClass}>
              Plans
            </PricingCtaLink>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
