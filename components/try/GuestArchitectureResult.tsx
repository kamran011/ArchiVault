"use client"

import dynamic from "next/dynamic"
import type { Architecture } from "@/types/architecture"
import type { UserPlan } from "@/lib/plan-gate"
import { normalizeError } from "@/lib/normalize-error"
import { ChunkLoadErrorBoundary } from "@/components/shared/ChunkLoadErrorBoundary"

const CHUNK_ERROR =
  "Failed to load blueprint viewer. Hard-refresh (Ctrl+Shift+R) or run npm run dev:clean."

const ArchitectureOutput = dynamic(
  async () => {
    try {
      const mod = await import("@/components/dashboard/ArchitectureOutput")
      return { default: mod.ArchitectureOutput }
    } catch (reason) {
      throw normalizeError(reason, CHUNK_ERROR)
    }
  },
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Loading your blueprint…
      </div>
    ),
  },
)

export function GuestArchitectureResult({
  data,
  userPlan = "free",
}: {
  data: Architecture
  userPlan?: UserPlan
}) {
  return (
    <ChunkLoadErrorBoundary title="Could not load blueprint viewer">
      <ArchitectureOutput data={data} userPlan={userPlan} />
    </ChunkLoadErrorBoundary>
  )
}
