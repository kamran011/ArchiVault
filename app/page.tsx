"use client"

import Link from "next/link"
import { Show, UserButton } from "@clerk/nextjs"

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl text-cyan-400">⚡</span>
            <span className="text-lg font-bold text-white">Archivolt</span>
          </div>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
              >
                Get started
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-8 ring-2 ring-cyan-500/30",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400">
            <span className="text-cyan-400" aria-hidden>
              ⚡
            </span>
            AI-powered · Architecture that survives change
          </div>
          <h1 className="mb-6 text-5xl font-semibold tracking-tight md:text-7xl">
            Architect your system
            <span className="block text-cyan-400">for the next 10 years</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-zinc-400">
            When your client says &quot;email is so 90s, use SMS instead&quot; — you change one adapter. Not your
            entire codebase.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-black transition-colors hover:bg-cyan-400"
            >
              Generate free architecture
            </Link>
            <a
              href="#example"
              className="rounded-xl border border-zinc-700 px-8 py-3.5 text-base text-zinc-300 transition-colors hover:border-zinc-500"
            >
              See example output
            </a>
          </div>
          <p className="mt-4 text-sm text-zinc-600">No credit card required · First architecture free</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-zinc-800/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold">How Archivolt works</h2>
          <p className="mb-16 text-center text-zinc-400">Three steps from prose to governed interfaces</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Describe your system",
                desc: "Plain English beats boxes and lines. Outline actors, integrations, workflows, scale, and what must never break.",
              },
              {
                num: "02",
                title: "Isolate volatility axes",
                desc: "The AI hunts for what WILL change independently — carriers, gateways, tenants, jurisdictions — behind stable I-prefixed contracts.",
              },
              {
                num: "03",
                title: "Ship diagrams + roadmap",
                desc: "Get a Mermaid architecture map, adapter contracts, build sequencing, tech guidance, and a volatility score.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700"
              >
                <div className="mb-4 font-mono text-sm font-bold text-cyan-400">{step.num}</div>
                <h3 className="mb-3 text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLE AXIS */}
      <section id="example" className="scroll-mt-24 border-t border-zinc-800/50 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold">What a volatility contract looks like</h2>
          <p className="mb-12 text-center text-zinc-400">
            Every volatile channel gets one interface. Swap SMS, email, or push without touching core orchestration.
          </p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xl font-bold text-cyan-400">INotificationSender</h3>
                <p className="mt-1 text-sm text-zinc-500">Axis: outbound customer communications</p>
              </div>
              <span className="rounded-full border border-cyan-800 bg-cyan-950 px-3 py-1 text-xs text-cyan-400">
                Volatile axis
              </span>
            </div>
            <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm">
              <div className="mb-1 text-zinc-500">{"// Interface contract"}</div>
              <div className="text-purple-400">
                interface <span className="text-cyan-400">INotificationSender</span> {"{"}
              </div>
              <div className="pl-4 text-zinc-300">
                send(recipients: Recipient[], envelope: DispatchEnvelope): Promise{"<void>"};
              </div>
              <div className="pl-4 text-zinc-300">
                schedule(job: ScheduledNotification): Promise{"<CronTicket>"};
              </div>
              <div className="text-purple-400">{"}"}</div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-zinc-800/50 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-400">Ship today</div>
                <p className="text-sm text-zinc-300">SES + Twilio SMS fallback with shared envelope schema</p>
              </div>
              <div className="rounded-xl bg-zinc-800/50 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-yellow-400">Swap later</div>
                <p className="text-sm text-zinc-300">WhatsApp Business, push via FCM, or internal pub/sub fan-out</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-t border-zinc-800/50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">Pricing</h2>
          <p className="mb-16 text-center text-zinc-400">Start free, scale when architecture reviews become daily work</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-1 text-lg font-bold">Free</h3>
              <p className="mb-4 text-sm text-zinc-500">Try the full VBD analysis once</p>
              <div className="mb-6 text-4xl font-bold">$0</div>
              <ul className="mb-8 space-y-3">
                {["1 architecture generation", "Mermaid + volatility map", "Great for proof of concept"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-cyan-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block rounded-xl border border-zinc-700 py-2.5 text-center text-sm text-zinc-300 transition-colors hover:border-zinc-500"
              >
                Start free
              </Link>
            </div>

            {/* Pro - highlighted */}
            <div className="relative rounded-2xl border-2 border-cyan-500 bg-zinc-900 p-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-black">
                MOST POPULAR
              </div>
              <h3 className="mb-1 text-lg font-bold">Pro</h3>
              <p className="mb-4 text-sm text-zinc-500">For builders shipping multiple products</p>
              <div className="mb-6 text-4xl font-bold">
                $29<span className="text-lg text-zinc-500">/mo</span>
              </div>
              <ul className="mb-8 space-y-3">
                {["Unlimited generations", "PDF export + history", "Priority model updates"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-cyan-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block rounded-xl bg-cyan-500 py-2.5 text-center text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
              >
                Get started
              </Link>
            </div>

            {/* Team */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-1 text-lg font-bold">Team</h3>
              <p className="mb-4 text-sm text-zinc-500">For design reviews and shared standards</p>
              <div className="mb-6 text-4xl font-bold">
                $79<span className="text-lg text-zinc-500">/mo</span>
              </div>
              <ul className="mb-8 space-y-3">
                {["Everything in Pro", "Team sharing", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-cyan-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block rounded-xl border border-zinc-700 py-2.5 text-center text-sm text-zinc-300 transition-colors hover:border-zinc-500"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">⚡</span>
            <span className="text-sm text-zinc-400">Archivolt · Volatility-Based Decomposition</span>
          </div>
          <p className="text-xs text-zinc-600">© 2026 Archivolt</p>
        </div>
      </footer>
    </div>
  )
}
