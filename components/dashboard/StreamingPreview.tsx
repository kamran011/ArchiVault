"use client";

import * as React from "react";

const STREAMING_MESSAGES = [
  "Identifying volatility axes...",
  "Designing stable core services...",
  "Mapping interface contracts...",
  "Generating architecture diagram...",
  "Calculating future-proof score...",
  "Building implementation sequence...",
  "Finalizing blueprint...",
] as const;

type StreamingPreviewProps = {
  streamingText: string;
  isStreaming: boolean;
};

export function StreamingPreview({ streamingText, isStreaming }: StreamingPreviewProps) {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isStreaming) {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STREAMING_MESSAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  if (!isStreaming) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex gap-1" aria-hidden>
          <div className="size-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0ms]" />
          <div className="size-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />
          <div className="size-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
        </div>
        <span className="text-sm text-zinc-400">{STREAMING_MESSAGES[messageIndex]}</span>
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-500">
        {streamingText}
        <span className="ml-0.5 inline-block h-3 w-2 animate-pulse bg-cyan-400" aria-hidden />
      </div>

      <p className="mt-3 text-center text-xs text-zinc-600">
        Building your VBD blueprint — this takes 30–90 seconds
      </p>
    </div>
  );
}
