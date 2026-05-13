"use client";

import type { Architecture } from "@/types/architecture";
import type { UserPlan } from "@/lib/plan-gate";
import { canAccessScaffoldPrompt, canExportPdf } from "@/lib/plan-gate";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { VolatilityAxes } from "./VolatilityAxes";
import { InterfaceContracts } from "./InterfaceContracts";
import { MermaidDiagram } from "./MermaidDiagram";
import { ExportPdfLocked } from "./ExportPdfLocked";
import { CopyButton } from "@/components/shared/CopyButton";
import { ScaffoldPromptUpgrade } from "./ScaffoldPromptUpgrade";

const ExportButton = dynamic(
  () => import("./ExportButton").then((m) => ({ default: m.ExportButton })),
  { ssr: false },
);

function stabilityBadgeClass(stability: string) {
  if (stability === "high") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (stability === "medium") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
  return "border-red-500/30 bg-red-500/10 text-red-300";
}

export function ArchitectureOutput({
  data,
  userPlan = "free",
  scaffoldLanguage = "Any",
}: {
  data: Architecture;
  userPlan?: UserPlan;
  scaffoldLanguage?: string;
}) {
  const clampedScore = Math.min(100, Math.max(1, data.futureProofScore));
  const hasProAccess = canAccessScaffoldPrompt(userPlan);
  const canPdf = canExportPdf(userPlan);
  const scaffoldPrompt = data.scaffoldPrompt;

  const tabTriggerClass = cn(
    "shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors",
    "hover:text-zinc-300",
    "data-active:bg-zinc-800 data-active:text-white data-active:shadow-sm",
    "aria-selected:bg-zinc-800 aria-selected:text-white",
    "shadow-none after:hidden",
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">Latest Result</p>
          <h2 className="text-2xl font-semibold text-white">{data.systemName}</h2>
        </div>
        {canPdf ? <ExportButton architecture={data} /> : <ExportPdfLocked />}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="no-scrollbar flex w-full gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          <TabsTrigger value="overview" className={tabTriggerClass}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="volatility" className={tabTriggerClass}>
            Volatile axes
          </TabsTrigger>
          <TabsTrigger value="services" className={tabTriggerClass}>
            Core services
          </TabsTrigger>
          <TabsTrigger value="diagram" className={tabTriggerClass}>
            Diagram
          </TabsTrigger>
          <TabsTrigger value="roadmap" className={tabTriggerClass}>
            Build order
          </TabsTrigger>
          <TabsTrigger value="scaffold" className={cn(tabTriggerClass, "gap-1.5")}>
            {!hasProAccess ? <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden /> : null}
            Scaffold prompt
            {!hasProAccess ? (
              <Badge className="border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0 text-[9px] font-semibold uppercase text-cyan-300">
                Pro
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 w-full outline-none">
          <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-3 text-sm uppercase tracking-widest text-zinc-500">Executive Summary</h3>
            <p className="leading-relaxed text-zinc-200">{data.summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="mb-4 text-xs uppercase tracking-widest text-zinc-500">Future-Proof Score</p>
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray={`${clampedScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-cyan-400">{clampedScore}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 md:col-span-2">
              <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">Why this score</p>
              <p className="text-sm leading-relaxed text-zinc-300">{data.futureProofExplanation}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="volatility" className="mt-4 w-full space-y-8 outline-none">
          <VolatilityAxes axes={data.volatilityAxes} />
          <Separator className="bg-zinc-800" />
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-500">
              Interface sketches
            </h3>
            <InterfaceContracts axes={data.volatilityAxes} />
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-4 w-full space-y-4 outline-none">
          {data.coreServices.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-500">No core services in this generation. Run a new prompt to regenerate.</p>
            </div>
          ) : (
            data.coreServices.map((svc) => (
              <Card key={svc.name} className="w-full rounded-xl border-zinc-800 bg-zinc-900">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <CardTitle className="text-lg text-white">{svc.name}</CardTitle>
                    <Badge className={cn("text-[10px] capitalize", stabilityBadgeClass(svc.stability))}>
                      {svc.stability} stability
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-zinc-400">{svc.responsibility}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Depends on</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {svc.dependsOn.map((dep) => (
                      <Badge
                        key={`${svc.name}-${dep}`}
                        variant="outline"
                        className="border-cyan-500/30 bg-cyan-500/10 font-mono text-[11px] text-cyan-300"
                      >
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="diagram" className="mt-4 w-full outline-none">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <MermaidDiagram diagram={data.mermaidDiagram} systemName={data.systemName} />
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-4 w-full space-y-4 outline-none">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 text-base font-semibold text-white">Implementation sequence</h3>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-zinc-400">
              {data.implementationOrder.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 text-base font-semibold text-white">Technical recommendations</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
              {data.technicalRecommendations.map((tip, index) => (
                <li key={`${tip}-${index}`}>{tip}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="scaffold" className="mt-4 w-full outline-none">
          {!hasProAccess ? (
            <ScaffoldPromptUpgrade />
          ) : scaffoldPrompt ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">Scaffold prompt</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Paste this into Cursor Agent or Claude Code to scaffold your project.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-zinc-700 font-mono text-xs text-zinc-300">
                    {scaffoldLanguage}
                  </Badge>
                  <CopyButton text={scaffoldPrompt} label="Copy prompt" />
                </div>
              </div>
              <pre className="max-h-[min(70vh,560px)] overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-300">
                {scaffoldPrompt}
              </pre>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
              <p className="text-sm text-zinc-400">
                This generation was created before scaffold prompts were available. Run a new generation to unlock
                your scaffold prompt.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
