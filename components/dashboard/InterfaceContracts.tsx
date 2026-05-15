import { accentHighlightClass } from "@/lib/theme-badges";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Architecture } from "@/types/architecture";
import { CopyButton } from "@/components/shared/CopyButton";

export function InterfaceContracts({ axes }: { axes: Architecture["volatilityAxes"] }) {
  return (
    <div className="space-y-4">
      {axes.map((axis) => (
        <Card key={axis.id} className="rounded-xl border border-dashed border-border bg-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{axis.name}</p>
              <CardTitle className={cn("mt-2 font-mono text-base", accentHighlightClass)}>{axis.interfaceName}</CardTitle>
            </div>
            <CopyButton
              text={[`contract ${axis.interfaceName}`, "", ...axis.methods].join("\n")}
              label="Copy contract"
            />
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground/90">{`abstract ${axis.interfaceName} {
${axis.methods.map((m) => `  ${m};`).join("\n")}
}`}</pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
