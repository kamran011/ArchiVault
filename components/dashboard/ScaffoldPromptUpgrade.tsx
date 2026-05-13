"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const EXAMPLE_SCAFFOLD = `Build a CoursePlatform using Volatility-Based Decomposition architecture.

## Project Setup
- Language: TypeScript
- Framework: Node.js + Express
- Package manager: npm

## Core Interfaces to Scaffold

1. src/interfaces/IPaymentProcessor.ts
   Methods:
   - processPayment(amount: number, currency: string): Promise<void>
   - refundPayment(transactionId: string): Promise<void>

2. src/interfaces/INotificationSender.ts
   Methods:
   - send(recipient: string, message: Message): Promise<void>

## Concrete Adapters to Scaffold

1. src/adapters/payment/StripePaymentProcessor.ts
   - Implements IPaymentProcessor
   - Use Stripe SDK
   - Stub methods with TODO comments

2. src/adapters/notification/EmailNotificationSender.ts
   - Implements INotificationSender
   - Use SendGrid SDK

## Core Services to Scaffold

1. src/services/CourseOrchestrator.ts
   - Depends on: IPaymentProcessor, INotificationSender
   - Constructor injection pattern

## Folder Structure
src/
├── interfaces/
├── adapters/
│   ├── payment/
│   └── notification/
├── services/
└── config/
    └── container.ts

Use constructor injection throughout. Never instantiate adapters directly in services. Wire everything in container.ts only.`;

export function ScaffoldPromptUpgrade() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="relative p-6">
        <pre
          className="max-h-80 overflow-hidden whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300 blur-sm select-none pointer-events-none opacity-50"
          aria-hidden
        >
          {EXAMPLE_SCAFFOLD}
        </pre>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/60 px-6 text-center backdrop-blur-[2px]">
          <div className="flex size-12 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
            <Lock className="size-5 text-cyan-400" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Scaffold prompt locked</h3>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Upgrade to Pro to get a ready-to-paste prompt for AI-native coding agents that scaffolds your entire
              project from this architecture.
            </p>
          </div>
          <Button
            type="button"
            disabled={loading}
            className="bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
            onClick={() => void startCheckout()}
          >
            {loading ? "Redirecting…" : "Upgrade to Pro to unlock"}
          </Button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
