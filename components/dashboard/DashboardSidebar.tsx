"use client";

import * as React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format-relative-date";
import type { UserPlan } from "@/lib/plan-gate";
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

  async function startCheckout() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-cyan-400" aria-hidden>
            ⚡
          </span>
          <span className="text-base font-semibold text-white">Archivolt</span>
        </div>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={onNew}
          className="group flex w-full items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2.5 text-sm text-zinc-300 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
        >
          <Plus className="size-4 text-zinc-500 transition-colors group-hover:text-cyan-400" aria-hidden />
          New architecture
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3" role="navigation" aria-label="Recent architectures">
        <p className="mb-1 px-2 py-2 text-xs uppercase tracking-widest text-zinc-600">Recent</p>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full animate-pulse rounded-lg bg-zinc-800" />
            <Skeleton className="h-16 w-full animate-pulse rounded-lg bg-zinc-800" />
            <Skeleton className="h-16 w-full animate-pulse rounded-lg bg-zinc-800" />
          </div>
        ) : generations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-zinc-600">
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
                    active ? "border-cyan-500 bg-zinc-800" : "border-transparent hover:bg-zinc-800",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {row.result?.systemName || "Untitled"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {previewDescription(row.description)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">{formatRelativeDate(row.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete ${row.result?.systemName || "architecture"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row.id, row.result?.systemName || "Untitled");
                    }}
                    className="mt-0.5 shrink-0 rounded p-1 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-700 hover:text-red-400 group-hover:opacity-100"
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
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-7 ring-2 ring-cyan-500/30",
                },
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-300">{displayName}</p>
              <p className="text-xs capitalize text-zinc-600">{userPlan} plan</p>
            </div>
          </div>
          {userPlan === "free" ? (
            <button
              type="button"
              disabled={upgrading}
              onClick={() => void startCheckout()}
              className="shrink-0 text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300 disabled:opacity-50"
            >
              {upgrading ? "…" : "Upgrade"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
