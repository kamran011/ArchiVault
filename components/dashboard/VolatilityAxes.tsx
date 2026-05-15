import { accentHighlightClass } from "@/lib/theme-badges";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Architecture } from "@/types/architecture";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/shared/CopyButton";

export function VolatilityAxes({ axes }: { axes: Architecture["volatilityAxes"] }) {
  return (
    <div className="space-y-4">
      {axes.map((axis) => (
        <Card key={axis.id} className="rounded-xl border-border bg-card shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{axis.name}</p>
              <CardTitle className={cn("mt-2 font-mono text-lg", accentHighlightClass)}>{axis.interfaceName}</CardTitle>
            </div>
            <CopyButton text={axis.interfaceName} label="Copy interface name" />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why volatile</p>
              <p className="mt-2 text-muted-foreground">{axis.reason}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">Change scenario</p>
              <p className="mt-2 text-sm text-amber-100/90">{axis.changeScenario}</p>
            </div>
            <Separator className="bg-muted" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Methods</p>
              <div className="mt-3 space-y-2">
                {axis.methods.map((m) => (
                  <div
                    key={m}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground/90"
                  >
                    <span className="flex-1 break-all">{m}</span>
                    <CopyButton text={m} label="Copy" />
                  </div>
                ))}
              </div>
            </div>
            <Separator className="bg-muted" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ship today</p>
                <p className="mt-2 text-muted-foreground">{axis.currentImplementation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alternatives</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                  {axis.alternativeImplementations.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground/70">Axis id: {axis.id}</CardFooter>
        </Card>
      ))}
    </div>
  );
}
