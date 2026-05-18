"use client";

import dynamic from "next/dynamic";
import { normalizeError } from "@/lib/normalize-error";
import { ChunkLoadErrorBoundary } from "@/components/shared/ChunkLoadErrorBoundary";

const CHUNK_ERROR =
  "Failed to load Architecture studio. Hard-refresh (Ctrl+Shift+R) or run npm run dev:clean.";

const DashboardApp = dynamic(
  async () => {
    try {
      const mod = await import("./DashboardApp");
      return { default: mod.DashboardApp };
    } catch (reason) {
      throw normalizeError(reason, CHUNK_ERROR);
    }
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading studio…
      </div>
    ),
  },
);

export function DashboardGate() {
  return (
    <ChunkLoadErrorBoundary title="Could not load Architecture studio">
      <DashboardApp />
    </ChunkLoadErrorBoundary>
  );
}
