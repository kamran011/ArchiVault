import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Architecture } from "@/types/architecture";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/shared/CopyButton";

export function VolatilityAxes({ axes }: { axes: Architecture["volatilityAxes"] }) {
  return (
    <div className="space-y-4">
      {axes.map((axis) => (
        <Card key={axis.id} className="rounded-xl border-zinc-800 bg-zinc-900 shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{axis.name}</p>
              <CardTitle className="mt-2 font-mono text-lg text-cyan-400">{axis.interfaceName}</CardTitle>
            </div>
            <CopyButton text={axis.interfaceName} label="Copy interface name" />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Why volatile</p>
              <p className="mt-2 text-zinc-400">{axis.reason}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">Change scenario</p>
              <p className="mt-2 text-sm text-amber-100/90">{axis.changeScenario}</p>
            </div>
            <Separator className="bg-zinc-800" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Methods</p>
              <div className="mt-3 space-y-2">
                {axis.methods.map((m) => (
                  <div
                    key={m}
                    className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-200"
                  >
                    <span className="flex-1 break-all">{m}</span>
                    <CopyButton text={m} label="Copy" />
                  </div>
                ))}
              </div>
            </div>
            <Separator className="bg-zinc-800" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Ship today</p>
                <p className="mt-2 text-zinc-400">{axis.currentImplementation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Alternatives</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-zinc-400">
                  {axis.alternativeImplementations.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-zinc-600">Axis id: {axis.id}</CardFooter>
        </Card>
      ))}
    </div>
  );
}
