"use client";

import * as React from "react";
import type { Architecture, SystemDesign, TechStackAnalysis } from "@/types/architecture";
import type { UserPlan } from "@/lib/plan-gate";
import {
  canAccessScaffoldPrompt,
  canAccessSystemDesign,
  canAccessTechStack,
  canExportPdf,
} from "@/lib/plan-gate";
import { ExportButton } from "./ExportButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, stripLeadingListMarker } from "@/lib/utils";
import {
  accentBadgeClass,
  accentHighlightClass,
  accentMonoBadgeClass,
  blueprintTabBadgeClass,
  proTabBadgeClass,
  stabilityBadgeClass,
  teamTabBadgeClass,
} from "@/lib/theme-badges";
import { Lock } from "lucide-react";
import { VolatilityAxes } from "./VolatilityAxes";
import { InterfaceContracts } from "./InterfaceContracts";
import { MermaidDiagram } from "./MermaidDiagram";
import { FutureProofRationale } from "./FutureProofRationale";
import { resolveFutureProofRationale } from "@/lib/future-proof-rationale";
import { ExportPdfLocked } from "./ExportPdfLocked";
import { ScaffoldPromptUpgrade } from "./ScaffoldPromptUpgrade";
import { SystemDesignTab } from "./SystemDesignTab";
import { SystemDesignUpgrade } from "./SystemDesignUpgrade";
import { ScaffoldPromptTab } from "./ScaffoldPromptTab";
import { TechStackTab } from "./TechStackTab";
import { TechStackUpgrade } from "./TechStackUpgrade";
import { TabGeneratingIndicator } from "./TabGeneratingIndicator";

export function ArchitectureOutput({
  data,
  userPlan = "free",
  techStack = "Any",
  generationId = null,
  onSystemDesignUpdate,
  onTechStackUpdate,
  onScaffoldUpdate,
}: {
  data: Architecture;
  userPlan?: UserPlan;
  techStack?: string;
  generationId?: string | null;
  onSystemDesignUpdate?: (systemDesign: SystemDesign) => void;
  onTechStackUpdate?: (techStackAnalysis: TechStackAnalysis) => void;
  onScaffoldUpdate?: (scaffoldPrompt: string) => void;
}) {
  const clampedScore = Math.min(100, Math.max(1, data.futureProofScore));
  const futureProofRationale = resolveFutureProofRationale(data);
  const hasScaffoldAccess = canAccessScaffoldPrompt(userPlan);
  const hasTechStackAccess = canAccessTechStack(userPlan);
  const hasTeamAccess = canAccessSystemDesign(userPlan);
  const canPdf = canExportPdf(userPlan);

  const [isGeneratingTechStack, setIsGeneratingTechStack] = React.useState(false);
  const [isGeneratingScaffoldPrompt, setIsGeneratingScaffoldPrompt] = React.useState(false);
  const [isGeneratingSystemDesign, setIsGeneratingSystemDesign] = React.useState(false);

  React.useEffect(() => {
    setIsGeneratingTechStack(false);
    setIsGeneratingScaffoldPrompt(false);
    setIsGeneratingSystemDesign(false);
  }, [generationId]);

  const tabTriggerClass = cn(
    "shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
    "hover:text-foreground/80",
    "data-active:bg-accent data-active:text-foreground data-active:shadow-sm",
    "aria-selected:bg-accent aria-selected:text-foreground",
    "shadow-none after:hidden",
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Latest Result</p>
          <h2 className="text-2xl font-semibold text-foreground">{data.systemName}</h2>
        </div>
        {canPdf ? <ExportButton architecture={data} /> : <ExportPdfLocked />}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="no-scrollbar flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
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
          <TabsTrigger
            value="techstack"
            className={cn(tabTriggerClass, "gap-1.5")}
            aria-busy={isGeneratingTechStack}
          >
            {!hasTechStackAccess ? <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden /> : null}
            Tech Stack
            {isGeneratingTechStack ? <TabGeneratingIndicator /> : null}
            {!hasTechStackAccess ? (
              <Badge className={proTabBadgeClass}>Pro</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="scaffold"
            className={cn(tabTriggerClass, "gap-1.5")}
            aria-busy={isGeneratingScaffoldPrompt}
          >
            {!hasScaffoldAccess ? <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden /> : null}
            Scaffold prompt
            {isGeneratingScaffoldPrompt ? <TabGeneratingIndicator /> : null}
            {!hasScaffoldAccess ? (
              <Badge className={blueprintTabBadgeClass}>Blueprint</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="systemdesign"
            className={cn(tabTriggerClass, "gap-1.5")}
            aria-busy={isGeneratingSystemDesign}
          >
            {!hasTeamAccess ? <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden /> : null}
            System Design
            {isGeneratingSystemDesign ? <TabGeneratingIndicator /> : null}
            {!hasTeamAccess ? (
              <Badge className={teamTabBadgeClass}>
                Team
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 w-full outline-none">
          <div className="mb-4 rounded-xl border border-border bg-card p-6">
            <h3 className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">Executive Summary</h3>
            <p className="leading-relaxed text-foreground/90">{data.summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Future-Proof Score</p>
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
                  <span className={cn("text-3xl font-bold", accentHighlightClass)}>{clampedScore}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 md:col-span-2">
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Why this score</p>
              <FutureProofRationale
                rationale={futureProofRationale}
                fallbackText={data.futureProofExplanation}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="volatility" className="mt-4 w-full space-y-8 outline-none">
          <VolatilityAxes axes={data.volatilityAxes} />
          <Separator className="bg-muted" />
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Interface sketches
            </h3>
            <InterfaceContracts axes={data.volatilityAxes} />
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-4 w-full space-y-4 outline-none">
          {data.coreServices.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">No core services in this generation. Run a new prompt to regenerate.</p>
            </div>
          ) : (
            data.coreServices.map((svc) => (
              <Card key={svc.name} className="w-full rounded-xl border-border bg-card">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <CardTitle className="text-lg text-foreground">{svc.name}</CardTitle>
                    <Badge className={cn("text-[10px] capitalize", stabilityBadgeClass(svc.stability))}>
                      {svc.stability} stability
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">{svc.responsibility}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Depends on</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {svc.dependsOn.map((dep) => (
                      <Badge
                        key={`${svc.name}-${dep}`}
                        variant="outline"
                        className={cn(accentMonoBadgeClass)}
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
          <div className="rounded-xl border border-border bg-card p-6">
            <MermaidDiagram diagram={data.mermaidDiagram} systemName={data.systemName} />
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-4 w-full space-y-4 outline-none">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">Implementation sequence</h3>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
              {data.implementationOrder.map((step, index) => (
                <li key={`${step}-${index}`}>{stripLeadingListMarker(step)}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">Technical recommendations</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {data.technicalRecommendations.map((tip, index) => (
                <li key={`${tip}-${index}`}>{tip}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="techstack" keepMounted className="mt-4 w-full outline-none data-[hidden]:hidden">
          {!hasTechStackAccess ? (
            <TechStackUpgrade userPlan={userPlan} />
          ) : (
            <TechStackTab
              key={`${generationId ?? "draft"}-tech`}
              architecture={data}
              generationId={generationId}
              techStack={techStack}
              onTechStackUpdate={onTechStackUpdate}
              onGeneratingChange={setIsGeneratingTechStack}
            />
          )}
        </TabsContent>

        <TabsContent value="scaffold" keepMounted className="mt-4 w-full outline-none data-[hidden]:hidden">
          {!hasScaffoldAccess ? (
            <ScaffoldPromptUpgrade />
          ) : (
            <ScaffoldPromptTab
              key={`${generationId ?? "draft"}-scaffold`}
              architecture={data}
              techStack={techStack}
              generationId={generationId}
              onScaffoldUpdate={onScaffoldUpdate}
              onGeneratingChange={setIsGeneratingScaffoldPrompt}
            />
          )}
        </TabsContent>

        <TabsContent value="systemdesign" keepMounted className="mt-4 w-full outline-none data-[hidden]:hidden">
          {!hasTeamAccess ? (
            <SystemDesignUpgrade />
          ) : (
            <SystemDesignTab
              key={generationId ?? "draft"}
              architecture={data}
              generationId={generationId}
              onSystemDesignUpdate={onSystemDesignUpdate}
              onGeneratingChange={setIsGeneratingSystemDesign}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
