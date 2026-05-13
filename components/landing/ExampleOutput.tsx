import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const sample = [
  `send(recipients: Recipient[], envelope: DispatchEnvelope): Promise<void>`,
  `schedule(job: ScheduledNotification): Promise<CronTicket>`,
];

const ifaceSample = `interface INotificationSender {
  dispatch(channel: DeliveryChannel): Promise<Result>;
}`;

export function ExampleOutput() {
  const block = ["```ts", ifaceSample.trim(), "```"].join("\n");

  return (
    <section id="example" className="scroll-mt-24 bg-[#0a0a0a] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <Badge className="mb-4 rounded-lg border-zinc-700 bg-zinc-900 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
            Example axis
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">What a volatility contract looks like</h2>
          <p className="mt-4 text-lg text-zinc-400">
            Every volatile channel gets one interface. Swap SMS, email, or push without touching core orchestration.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/30">
          <div className="flex flex-row items-start justify-between gap-4 border-b border-zinc-800 p-6">
            <div>
              <h3 className="font-mono text-lg font-semibold text-cyan-400">INotificationSender</h3>
              <p className="mt-1 text-sm text-zinc-500">Axis: outbound customer communications</p>
            </div>
            <CopyButton text={block} label="Copy sample" />
          </div>

          <div className="space-y-6 p-6 text-sm">
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
              <pre className="p-4 font-mono text-xs leading-relaxed sm:text-sm">
                <code>
                  <span className="text-violet-400">interface</span>{" "}
                  <span className="text-cyan-300">INotificationSender</span>{" "}
                  <span className="text-zinc-500">{"{"}</span>
                  {"\n  "}
                  <span className="text-emerald-400/90">dispatch</span>
                  <span className="text-zinc-400">(channel: </span>
                  <span className="text-amber-200/90">DeliveryChannel</span>
                  <span className="text-zinc-400">): </span>
                  <span className="text-violet-300">Promise</span>
                  <span className="text-zinc-400">&lt;</span>
                  <span className="text-amber-200/90">Result</span>
                  <span className="text-zinc-400">&gt;;</span>
                  {"\n"}
                  <span className="text-zinc-500">{"}"}</span>
                </code>
              </pre>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Why it is volatile</p>
              <p className="mt-2 text-zinc-400">
                Carriers, compliance, and preferred modalities change faster than your domain rules.
              </p>
            </div>

            <Separator className="bg-zinc-800" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Methods</p>
              <ul className="mt-3 space-y-2">
                {sample.map((m) => (
                  <li
                    key={m}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-zinc-800" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-4">
                <Badge className="mb-2 border-cyan-500/40 bg-cyan-500/10 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                  Ship today
                </Badge>
                <p className="text-sm text-zinc-300">SES + Twilio SMS fallback with shared envelope schema.</p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-950/20 p-4">
                <Badge className="mb-2 border-amber-500/35 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                  Swap later
                </Badge>
                <p className="text-sm text-zinc-300">WhatsApp Business, push via FCM, or internal pub/sub fan-out.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
