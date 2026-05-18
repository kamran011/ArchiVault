import { Pencil, Sparkles, Workflow } from "lucide-react"

const steps = [
  {
    icon: Pencil,
    title: "Describe",
    body: "Type your system in plain English — users, integrations, and what must stay stable.",
  },
  {
    icon: Sparkles,
    title: "Analyze",
    body: "Claude maps volatility axes — what will change independently — behind adapter contracts.",
  },
  {
    icon: Workflow,
    title: "Get Blueprint",
    body: "Receive a Mermaid diagram, interface contracts, build order, and a future-proof score.",
  },
] as const

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 border-t border-border/50 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-400">How it works</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Three steps to your blueprint</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            From plain English to governed architecture in about a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-cyan-500/30 md:items-start md:text-left"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <Icon className="size-6 text-cyan-400" aria-hidden />
              </div>
              <span className="mb-2 font-mono text-xs font-bold text-cyan-400/80">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
