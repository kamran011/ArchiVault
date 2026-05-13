"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = React.useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1400);
    } catch {}
  }
  return (
    <Button type="button" size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={onCopy}>
      {done ? <Check className="size-3.5 text-emerald-400" aria-hidden /> : <Copy className="size-3.5 opacity-70" aria-hidden />}
      <span>{done ? "Copied" : label}</span>
    </Button>
  );
}