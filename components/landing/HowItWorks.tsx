const steps = [
  {
    step: "01",
    title: "Describe your system",
    body: "Tell us what your system does: who uses it, what services it connects to, and what can't change. Plain English only.",
  },
  {
    step: "02",
    title: "Isolate volatility axes",
    body: "Claude hunts for what WILL change independently — payment providers, notification channels, storage backends — behind stable adapter contracts.",
  },
  {
    step: "03",
    title: "Ship diagrams + roadmap",
    body: "Get a Mermaid architecture map, adapter contracts, build sequencing, tech guidance, and a volatility score.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-zinc-800 bg-[#0a0a0a] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-400">Workflow</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How Archivolt works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            Three steps from prose to governed interfaces — no canvas theater.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ step, title, body }) => (
            <div
              key={step}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/20 transition hover:border-zinc-700"
            >
              <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 font-mono text-sm font-semibold text-cyan-400">
                {step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
