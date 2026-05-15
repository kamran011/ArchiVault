"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import type { Architecture, SystemDesign } from "@/types/architecture";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PromptInput } from "./PromptInput";
import type { PromptPayload } from "./types";
import type { UserPlan } from "@/lib/plan-gate";
import { generationLimitUi, isGenerationLimitReached } from "@/lib/plans";
import { ArchivoltLogo } from "@/components/brand/ArchivoltLogo";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { DeleteGenerationDialog } from "./DeleteGenerationDialog";
import { ArchitectureOutput } from "./ArchitectureOutput";
import { DashboardSidebar, type GenerationRow } from "./DashboardSidebar";
import { StreamingPreview } from "./StreamingPreview";
import { FadeIn } from "@/components/shared/FadeIn";
export function DashboardApp() {
  const exportId = React.useId().replace(/:/g, "");
  const promptRef = React.useRef<HTMLTextAreaElement>(null);

  const [architecture, setArchitecture] = React.useState<Architecture | null>(null);
  const [generations, setGenerations] = React.useState<GenerationRow[]>([]);
  const [activeGenId, setActiveGenId] = React.useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [userPlan, setUserPlan] = React.useState<UserPlan>("free");
  const [generationCount, setGenerationCount] = React.useState(0);
  const [techStack, setTechStack] = React.useState("Any");
  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = React.useState(false);
  const searchParams = useSearchParams();

  const loadPlan = React.useCallback(async () => {
    try {
      const res = await fetch("/api/user/plan");
      const body = await res.json();
      if (res.ok) {
        if (body?.plan) {
          setUserPlan(body.plan as UserPlan);
        }
        if (typeof body?.generationCount === "number") {
          setGenerationCount(body.generationCount);
        }
      }
    } catch {
      // keep default free
    }
  }, []);

  React.useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

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

  React.useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    void loadPlan();
    void loadGenerations();
  }, [searchParams, loadPlan, loadGenerations]);

  async function handleGenerate(payload: PromptPayload) {
    setError(null);
    setGenerating(true);
    setIsStreaming(true);
    setStreamingText("");
    setArchitecture(null);
    setActiveGenId(null);
    setTechStack(payload.techStack || "Any");

    try {
      const res = await fetch("/api/generate-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const message =
          res.status === 502
            ? "Generation failed — please try again."
            : (body?.error ?? "Generation failed");
        throw new Error(message);
      }

      if (!contentType.includes("text/event-stream") || !res.body) {
        const body = (await res.json()) as Architecture;
        setArchitecture(body);
        const mapped = await loadGenerations();
        void loadPlan();
        const newest = mapped[0];
        if (newest) setActiveGenId(newest.id);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamError: string | null = null;
      let completed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          let data: {
            chunk?: string;
            done?: boolean;
            architecture?: Architecture;
            generationId?: string;
            error?: string;
          };

          try {
            data = JSON.parse(line.slice(6)) as typeof data;
          } catch {
            continue;
          }

          if (data.chunk) {
            setStreamingText((prev) => prev + data.chunk);
          }

          if (data.error) {
            streamError = data.error;
          }

          if (data.done && data.architecture) {
            completed = true;
            setArchitecture(data.architecture);
            if (data.generationId) {
              setActiveGenId(data.generationId);
            }
            await loadGenerations();
            void loadPlan();
          }
        }
      }

      if (streamError) {
        throw new Error(streamError);
      }

      if (!completed) {
        throw new Error("Generation failed — please try again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  function loadGeneration(row: GenerationRow) {
    setActiveGenId(row.id);
    setArchitecture(row.result);
    setTechStack(row.tech_stack || "Any");
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

  const studioColumnClass = "mx-auto w-full max-w-6xl px-6";

  const generationLimitReached = isGenerationLimitReached(userPlan, generationCount);
  const limitUx = generationLimitReached ? generationLimitUi(userPlan) : null;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <DeleteGenerationDialog
        open={pendingDelete !== null}
        systemName={pendingDelete?.name ?? ""}
        deleting={deleting}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />

      <aside className="sticky top-0 z-20 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <DashboardSidebar {...sidebarProps} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {isViewMode ? (
          <div className="flex items-center justify-end gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
            <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
              <SheetTrigger
                type="button"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 border-border bg-card")}
              >
                <Menu className="size-4" />
                Menu
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw,360px)] border-border bg-card p-0">
                <DashboardSidebar {...sidebarProps} />
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="border-b border-border bg-background py-4">
            <div className={studioColumnClass}>
              <div className="flex items-start justify-between gap-3 lg:hidden">
                <div className="pl-6">
                  <BrandWordmark logoSize={20} textClassName="text-sm" className="mb-1" />
                  <h1 className="text-lg font-bold text-foreground">Architecture studio</h1>
                </div>
                <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
                  <SheetTrigger
                    type="button"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 border-border bg-card")}
                  >
                    <Menu className="size-4" />
                    Menu
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[min(100vw,360px)] border-border bg-card p-0">
                    <DashboardSidebar {...sidebarProps} />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="hidden items-start justify-between lg:flex">
                <div className="pl-6">
                  <BrandWordmark logoSize={22} textClassName="text-base" className="mb-2" />
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Architecture studio</h1>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                      {generationLimitReached
                        ? "You've reached your plan's generation limit. Upgrade to keep building architectures."
                        : "Describe volatility, freeze core workflows, and ship adapter-friendly boundaries."}
                    </p>
                </div>
                <BadgePill />
              </div>
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto py-6">
            <div className={cn(studioColumnClass, "space-y-8")}>
              {isCreateMode ? (
                <div className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/20">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-foreground">System brief</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {generationLimitReached
                        ? "You've reached your plan's generation limit. See below to upgrade and generate more."
                        : "Describe your system in plain English. The more detail, the better the output."}
                    </p>
                  </div>
                  <PromptInput
                    ref={promptRef}
                    disabled={generating}
                    generationLimitReached={generationLimitReached}
                    generationLimitUi={limitUx}
                    onSubmit={handleGenerate}
                  />
                </div>
              ) : null}

            {error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">{error}</div>
            ) : null}

            <div data-export-root={exportId}>
              {isStreaming ? (
                <StreamingPreview streamingText={streamingText} isStreaming={isStreaming} />
              ) : null}

              {!isStreaming && architecture ? (
                <FadeIn key={activeGenId ?? architecture.systemName}>
                <ArchitectureOutput
                  data={architecture}
                  userPlan={userPlan}
                  techStack={techStack}
                  generationId={activeGenId}
                  onSystemDesignUpdate={(systemDesign: SystemDesign) => {
                    setArchitecture((prev) => (prev ? { ...prev, systemDesign } : prev));
                    if (activeGenId) {
                      setGenerations((prev) =>
                        prev.map((row) =>
                          row.id === activeGenId
                            ? { ...row, result: { ...row.result, systemDesign } }
                            : row,
                        ),
                      );
                    }
                  }}
                  onTechStackUpdate={(techStackAnalysis) => {
                    setArchitecture((prev) => (prev ? { ...prev, techStackAnalysis } : prev));
                    if (activeGenId) {
                      setGenerations((prev) =>
                        prev.map((row) =>
                          row.id === activeGenId
                            ? { ...row, result: { ...row.result, techStackAnalysis } }
                            : row,
                        ),
                      );
                    }
                  }}
                  onScaffoldUpdate={(scaffoldPrompt) => {
                    setArchitecture((prev) => (prev ? { ...prev, scaffoldPrompt } : prev));
                    if (activeGenId) {
                      setGenerations((prev) =>
                        prev.map((row) =>
                          row.id === activeGenId
                            ? { ...row, result: { ...row.result, scaffoldPrompt } }
                            : row,
                        ),
                      );
                    }
                  }}
                />
                </FadeIn>
              ) : !isStreaming && isCreateMode ? (
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center py-24 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                    <ArchivoltLogo size={32} />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-foreground">Start with a system brief</h3>

                  <p className="mb-6 text-sm leading-relaxed text-zinc-500">
                    Describe any software system in plain English. Archivolt identifies what will change, what must
                    stay stable, and generates a future-proof blueprint.
                  </p>

                  <div className="flex w-full flex-col gap-2 text-left text-xs text-zinc-600">
                    <p className="mb-1 font-medium text-zinc-500">Try describing:</p>
                    <span>→ &quot;A marketplace where freelancers list services...&quot;</span>
                    <span>→ &quot;A SaaS for managing restaurant reservations...&quot;</span>
                    <span>→ &quot;A multi-tenant platform for fitness coaches...&quot;</span>
                  </div>
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
  // return (
  //   <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
  //     <Sparkles className="size-3.5" />
  //     VBDimage.png
  //   </div>
  // );
  return null;
}
