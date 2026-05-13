import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center px-4 py-16 sm:min-h-[calc(100dvh-4rem)] sm:px-6 sm:py-24">
      <div className="relative mx-auto grid max-w-6xl w-full gap-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Volatility-based decomposition
          </p>
          <h1 className="text-balance text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl lg:leading-[1.05]">
            Architect Your System
            <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
              for the Next 10 Years
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-xl text-zinc-400 lg:mx-0">
            When your client says email is so 90s — you change one adapter. Not your entire codebase.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-lg bg-cyan-500 px-8 font-semibold text-black shadow-lg shadow-cyan-500/25 hover:bg-cyan-400",
              )}
            >
              Generate Free Architecture
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/#example"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 rounded-lg border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900 hover:text-white",
              )}
            >
              See Example Output
            </Link>
          </div>
          <p className="mt-6 text-sm text-zinc-500">No credit card required · First architecture free</p>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            className="pointer-events-none absolute -inset-4 rounded-xl bg-gradient-to-br from-cyan-500/15 via-violet-600/10 to-transparent blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/40">
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
              <div className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-red-500/90" />
                <span className="size-2.5 rounded-full bg-amber-400/90" />
                <span className="size-2.5 rounded-full bg-emerald-500/90" />
              </div>
              <span className="ml-2 font-mono text-[10px] text-zinc-500">preview · INotificationSender</span>
            </div>
            <div className="space-y-4 p-5 font-mono text-[11px] leading-relaxed sm:p-6 sm:text-xs">
              <div className="rounded-lg border border-cyan-500/20 bg-zinc-950 p-3">
                <span className="text-cyan-500/80">{"// Stable core — domain rules"}</span>
                <pre className="mt-2 whitespace-pre-wrap text-zinc-200">
                  {`BillingOrchestrator
  .chargeInvoice(id)
  .refund(policy)`}
                </pre>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-zinc-400">
                <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-400">
                  INotificationSender
                </span>
                <span className="text-cyan-600/80">implements</span>
              </div>
              <div className="rounded-lg border border-violet-500/20 bg-zinc-950 p-3">
                <span className="text-violet-400/80">{"// Volatile axis — swap adapters"}</span>
                <pre className="mt-2 whitespace-pre-wrap text-zinc-200">
                  {`TwilioSmsAdapter
SesEmailAdapter
PushFcmAdapter`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
