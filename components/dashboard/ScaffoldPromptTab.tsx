"use client"

import { useState } from "react"
import type { Architecture } from "@/types/architecture"
import { CopyButton } from "@/components/shared/CopyButton"
import { Badge } from "@/components/ui/badge"
import { buildScaffoldPrompt } from "@/lib/build-scaffold-prompt"
import { FileCode2, Loader2 } from "lucide-react"

interface ScaffoldPromptTabProps {
  architecture: Architecture
  techStack: string
  generationId: string | null
  onScaffoldUpdate?: (scaffoldPrompt: string) => void
}

export function ScaffoldPromptTab({
  architecture,
  techStack,
  generationId,
  onScaffoldUpdate,
}: ScaffoldPromptTabProps) {
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scaffoldPrompt, setScaffoldPrompt] = useState<string | null>(
    architecture.scaffoldPrompt && architecture.scaffoldPrompt.length > 100
      ? architecture.scaffoldPrompt
      : null,
  )

  async function handleGenerate() {
    setBuilding(true)
    setError(null)
    try {
      const prompt = buildScaffoldPrompt(architecture, techStack)
      setScaffoldPrompt(prompt)
      onScaffoldUpdate?.(prompt)

      if (generationId) {
        const res = await fetch(`/api/generations/${generationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result: { scaffoldPrompt: prompt } }),
        })
        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          throw new Error(data.error ?? "Failed to save scaffold prompt")
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setBuilding(false)
    }
  }

  if (building) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="mb-3 h-6 w-6 animate-spin text-cyan-400" />
        <p className="text-sm text-muted-foreground">Building scaffold prompt...</p>
      </div>
    )
  }

  if (!scaffoldPrompt) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
          <FileCode2 className="h-6 w-6 text-cyan-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">Generate Scaffold Prompt</h3>
        <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
          Build a ready-to-paste Cursor or Claude Code prompt from your architecture — no extra AI
          call. Generate tech stack first for richer library recommendations.
        </p>
        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={building}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
        >
          <FileCode2 className="h-4 w-4" />
          Generate Scaffold Prompt
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Scaffold prompt</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste this into Cursor Agent or Claude Code to scaffold your project.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border font-mono text-xs text-foreground/80">
            {techStack}
          </Badge>
          <CopyButton text={scaffoldPrompt} label="Copy prompt" />
        </div>
      </div>
      <pre className="max-h-[min(70vh,560px)] overflow-auto whitespace-pre-wrap rounded-lg bg-background p-4 font-mono text-xs leading-relaxed text-foreground/80">
        {scaffoldPrompt}
      </pre>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={building}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground/80"
        >
          Rebuild scaffold prompt
        </button>
      </div>
    </div>
  )
}
