"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "What is Volatility-Based Decomposition (VBD)?",
    a: "VBD is a software architecture methodology that separates your system into stable core workflows and volatile adapters. The core (your business logic) never changes. The adapters (payment providers, notification channels, storage backends) can be swapped without touching core code. It was formalized by Juval Löwy and is used by senior architects to build systems that survive requirement changes.",
  },
  {
    q: "How is this different from just asking ChatGPT for architecture advice?",
    a: "ChatGPT gives generic advice in conversational form with no structure or persistence. Archivolt applies VBD methodology specifically, identifies every volatility axis in your system, generates typed interface contracts, provides a build order, calculates a future-proof score, and saves everything as a reusable blueprint. It's the difference between a chat and a structured architectural deliverable.",
  },
  {
    q: "Is the generated architecture actually usable in production?",
    a: "Yes. The output includes typed interface names (IPaymentProcessor, INotificationSender), concrete adapter recommendations for today, alternative adapters for the future, a dependency injection wiring guide, and a scaffold prompt you can paste directly into Cursor or Claude Code to generate the actual project structure.",
  },
  {
    q: "What's the difference between Blueprint and Pro?",
    a: "Blueprint is a one-time $49 purchase that gives you 4 total architecture generations — ideal if you're designing one product and don't need ongoing access. Pro is $29/month with unlimited generations, plus the Tech Stack analysis tab. Choose Blueprint if you have one system to design; choose Pro if you're iterating on features or designing multiple products.",
  },
  {
    q: "Can I use this for an existing system or only new ones?",
    a: "Both. For new systems, Archivolt helps you design the right boundaries before writing code. For existing systems, describe what you have and what's likely to change — Archivolt will identify which parts of your current architecture are fragile and what interfaces you should introduce to protect your core logic.",
  },
  {
    q: "What happens to my architecture data?",
    a: "Your system descriptions and generated blueprints are stored securely in your account. We never share your data with other users or use it to train AI models. You can delete any blueprint or your entire account at any time. GDPR compliant.",
  },
  {
    q: "How long does generation take?",
    a: "Phase 1 (the core blueprint: volatility axes, core services, diagram, build order, future-proof score) streams progressively and typically completes in 45–90 seconds. You see content appearing immediately, not a blank screen. The Tech Stack and System Design tabs generate on-demand in another 45–90 seconds each when you open them.",
  },
  {
    q: "Does it work for any tech stack?",
    a: "Yes. VBD is language and framework agnostic — the interfaces and adapter pattern work in TypeScript, Python, Java, C#, Go, or any other language. You can specify your preferred stack in the input and the scaffold prompt will use the correct syntax and conventions for that language.",
  },
] as const

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false)
  const panelId = React.useId()

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-card"
      >
        <span className="pr-4 text-sm font-medium text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="border-t border-border px-6 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground"
        >
          {answer}
        </div>
      ) : null}
    </div>
  )
}

export function FaqSection() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">FAQ</p>
          <h2 className="text-3xl font-bold text-foreground">Common questions</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Still have questions?{" "}
          <a href="mailto:hello@archivolt.dev" className="text-cyan-400 transition-colors hover:text-cyan-300">
            Email us
          </a>
        </p>
      </div>
    </section>
  )
}
