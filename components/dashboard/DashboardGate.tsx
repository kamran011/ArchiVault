"use client";

import dynamic from "next/dynamic";

const DashboardApp = dynamic(
  () => import("./DashboardApp").then((m) => ({ default: m.DashboardApp })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center bg-zinc-950 text-sm text-zinc-400">
        Loading studio…
      </div>
    ),
  },
);

export function DashboardGate() {
  return <DashboardApp />;
}
