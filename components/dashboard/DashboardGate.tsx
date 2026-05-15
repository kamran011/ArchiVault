"use client";

import dynamic from "next/dynamic";

const DashboardApp = dynamic(
  () => import("./DashboardApp").then((m) => ({ default: m.DashboardApp })),
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
  return <DashboardApp />;
}
