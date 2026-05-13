"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Menu, Sparkles } from "lucide-react";
import type { Architecture } from "@/types/architecture";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PromptInput } from "./PromptInput";
import type { PromptPayload } from "./types";
import type { UserPlan } from "@/lib/plan-gate";
import { DeleteGenerationDialog } from "./DeleteGenerationDialog";
import { ArchitectureOutput } from "./ArchitectureOutput";
import { DashboardSidebar, type GenerationRow } from "./DashboardSidebar";

export function DashboardApp() {
  const exportId = React.useId().replace(/:/g, "");
  const promptRef = React.useRef<HTMLTextAreaElement>(null);

  const [architecture, setArchitecture] = React.useState<Architecture | null>(null);
  const [generations, setGenerations] = React.useState<GenerationRow[]>([]);
  const [activeGenId, setActiveGenId] = React.useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userPlan, setUserPlan] = React.useState<UserPlan>("free");
  const [scaffoldLanguage, setScaffoldLanguage] = React.useState("Any");
  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      try {
        const res = await fetch("/api/user/plan");
        const body = await res.json();
        if (res.ok && body?.plan) {
          if (!cancelled) setUserPlan(body.plan as UserPlan);
        }
      } catch {
        // keep default free
      }
    }
    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadGenerations = React.useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/generations");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Could not load history");
      const list = Array.isArray(body.generations) ? body.generations : [];
      const mapped: GenerationRow[] = list.map((row: GenerationRow & { result: unknown }) => ({
        ...row,
        result: row.result as Architecture,
      }));
      setGenerations(mapped);
      return mapped;
    } catch (e) {
      setError(e instanceof Error ? e.message : "History failed");
      return [];
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    void loadGenerations();
  }, [loadGenerations]);

  async function handleGenerate(payload: PromptPayload) {
    setError(null);
    setGenerating(true);
    setScaffoldLanguage(payload.techStack || "Any");
    try {
      const res = await fetch("/api/generate-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        const message =
          res.status === 502
            ? "Generation failed — please try again."
            : (body?.error ?? "Generation failed");
        throw new Error(message);
      }
      setArchitecture(body as Architecture);
      const mapped = await loadGenerations();
      const newest = mapped[0];
      if (newest) setActiveGenId(newest.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  function loadGeneration(row: GenerationRow) {
    setActiveGenId(row.id);
    setArchitecture(row.result);
    setScaffoldLanguage(row.tech_stack || "Any");
    setError(null);
    setMobileHistoryOpen(false);
  }

  function handleNewArchitecture() {
    setActiveGenId(null);
    setArchitecture(null);
    setError(null);
    setMobileHistoryOpen(false);
    setTimeout(() => {
      promptRef.current?.focus();
      promptRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function requestDelete(id: string, name: string) {
    setPendingDelete({ id, name });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    const { id } = pendingDelete;
    const wasActive = activeGenId === id;

    setDeleting(true);
    setGenerations((prev) => prev.filter((row) => row.id !== id));

    if (wasActive) {
      setArchitecture(null);
      setActiveGenId(null);
    }

    try {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Delete failed");
      setPendingDelete(null);
    } catch (e) {
      await loadGenerations();
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const isViewMode = activeGenId !== null;
  const isCreateMode = !isViewMode;

  const sidebarProps = {
    generations,
    loading: loadingHistory,
    activeId: activeGenId,
    userPlan,
    onNew: handleNewArchitecture,
    onSelect: loadGeneration,
    onDelete: requestDelete,
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-zinc-950">
      <DeleteGenerationDialog
        open={pendingDelete !== null}
        systemName={pendingDelete?.name ?? ""}
        deleting={deleting}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />

      <aside className="sticky top-0 z-20 hidden h-dvh w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 lg:flex">
        <DashboardSidebar {...sidebarProps} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3 lg:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">Archivolt</p>
              <h1 className="text-lg font-bold text-white">Architecture studio</h1>
            </div>
            <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
              <SheetTrigger
                type="button"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 border-zinc-700 bg-zinc-900")}
              >
                <Menu className="size-4" />
                Menu
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw,360px)] border-zinc-800 bg-zinc-900 p-0">
                <DashboardSidebar {...sidebarProps} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden items-start justify-between lg:flex">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">Archivolt</p>
              <h1 className="text-2xl font-bold tracking-tight text-white">Architecture studio</h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Describe volatility, freeze core workflows, and ship adapter-friendly boundaries.
              </p>
            </div>
            <BadgePill />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {isViewMode ? (
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleNewArchitecture}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
                >
                  ← New architecture
                </button>
                <span className="text-zinc-700">|</span>
                <span className="text-sm text-zinc-400">Viewing saved blueprint</span>
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-6xl space-y-8">
              {isCreateMode ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/20">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">System brief</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {userPlan === "free" && generations.length >= 1
                        ? "You've used your free blueprint. Upgrade to Pro for unlimited."
                        : "Describe your system in plain English. The more detail, the better the output."}
                    </p>
                  </div>
                  <PromptInput ref={promptRef} disabled={generating} onSubmit={handleGenerate} />
                </div>
              ) : null}

            {error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">{error}</div>
            ) : null}

            <div data-export-root={exportId}>
              {generating ? (
                <div className="space-y-3">
                  <Skeleton className="h-40 w-full animate-pulse rounded-xl bg-zinc-800" />
                  <Skeleton className="h-40 w-full animate-pulse rounded-xl bg-zinc-800" />
                  <Skeleton className="h-24 w-full animate-pulse rounded-xl bg-zinc-800" />
                </div>
              ) : architecture ? (
                <ArchitectureOutput
                  data={architecture}
                  userPlan={userPlan}
                  scaffoldLanguage={scaffoldLanguage}
                />
              ) : isCreateMode ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                    <span className="text-2xl" aria-hidden>
                      ⚡
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">Describe your system above to generate your architecture</p>
                </div>
              ) : null}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgePill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
      <Sparkles className="size-3.5" />
      VBD + Claude Sonnet
    </div>
  );
}
