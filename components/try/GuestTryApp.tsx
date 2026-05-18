"use client"

import * as React from "react"
import Link from "next/link"
import { BrandWordmark } from "@/components/brand/BrandWordmark"
import { GuestArchitectureResult } from "@/components/try/GuestArchitectureResult"
import { PromptInput } from "@/components/dashboard/PromptInput"
import { StreamingPreview } from "@/components/dashboard/StreamingPreview"
import type { PromptPayload } from "@/components/dashboard/types"
import type { Architecture } from "@/types/architecture"
import { siteContainerClass, siteGutterClass } from "@/lib/site-layout"
import { telemetry } from "@/lib/telemetry"
import { cn } from "@/lib/utils"
import { errorMessage } from "@/lib/normalize-error"

const DEFAULT_DESCRIPTION =
  "A multi-tenant SaaS platform for fitness coaches to manage clients, sell programs, host workout videos, process payments, and send notifications."

export function GuestTryApp() {
  const [architecture, setArchitecture] = React.useState<Architecture | null>(null)
  const [generating, setGenerating] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [guestUsed, setGuestUsed] = React.useState(false)
  const generateInFlightRef = React.useRef(false)

  async function handleGenerate(payload: PromptPayload) {
    if (generateInFlightRef.current) return
    generateInFlightRef.current = true

    setError(null)
    setGenerating(true)
    setIsStreaming(true)
    setStreamingText("")
    setArchitecture(null)

    telemetry("guest_generation_started")

    try {
      const res = await fetch("/api/guest/generate-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        if (res.status === 403) setGuestUsed(true)
        throw new Error(body?.error ?? "Generation failed")
      }

      if (!res.body) {
        throw new Error("Generation failed")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let streamError: string | null = null
      let completed = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          let data: { chunk?: string; done?: boolean; architecture?: Architecture; error?: string }
          try {
            data = JSON.parse(line.slice(6)) as typeof data
          } catch {
            continue
          }

          if (data.chunk) setStreamingText((prev) => prev + data.chunk)
          if (data.error) streamError = data.error
          if (data.done && data.architecture) {
            completed = true
            setArchitecture(data.architecture)
            setGuestUsed(true)
            telemetry("guest_generation_completed")
          }
        }
      }

      if (streamError) throw new Error(streamError)
      if (!completed) throw new Error("Generation failed — please try again.")
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      generateInFlightRef.current = false
      setGenerating(false)
      setIsStreaming(false)
      setStreamingText("")
    }
  }

  return (
    <div className="landing-surface min-h-screen font-sans text-foreground antialiased">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className={siteGutterClass}>
          <div className={cn(siteContainerClass, "flex h-16 items-center justify-between gap-4")}>
            <BrandWordmark textClassName="text-lg" logoSize={28} />
            <Link
              href="/sign-up"
              className="shrink-0 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <main className={cn(siteGutterClass, "py-8 sm:py-10")}>
        <div className={cn(siteContainerClass, "mx-auto w-full min-w-0 max-w-3xl space-y-8")}>
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Try Archivolt as a guest</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              One free VBD blueprint — no account required. Sign up afterward to save it.
            </p>
          </div>
          {!architecture && !guestUsed && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/20 sm:p-8">
              <div className="mb-6 border-b border-border/60 pb-6">
                <h2 className="text-lg font-semibold text-foreground">System brief</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Describe your system in plain English. The more detail, the better the blueprint.
                </p>
              </div>
              <PromptInput
                disabled={generating}
                onSubmit={handleGenerate}
                userPlan="free"
                generationLimitReached={false}
                initialDescription={DEFAULT_DESCRIPTION}
              />
            </div>
          )}
          {guestUsed && !architecture && !generating && (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="mb-4 text-muted-foreground">
                You have used your free guest blueprint. Sign up to save results and generate again.
              </p>
              <Link
                href="/sign-up"
                className="landing-cta landing-cta-primary inline-flex rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
              >
                Sign up to continue
              </Link>
            </div>
          )}
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <StreamingPreview streamingText={streamingText} isStreaming={isStreaming} />
          {architecture && (
            <div className="space-y-6">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-7 text-center sm:px-8 sm:py-8">
                <div className="mx-auto flex max-w-xl flex-col items-center gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Sign up to save your blueprint</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Create a free account to keep this result in your dashboard and unlock more features.
                    </p>
                  </div>
                  <Link
                    href="/sign-up?from=guest"
                    onClick={() => telemetry("guest_signup_prompt_click")}
                    className="landing-cta landing-cta-primary inline-flex rounded-xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-black hover:bg-cyan-400"
                  >
                    Sign up to save your blueprint
                  </Link>
                </div>
              </div>
              <div className="min-w-0">
                <GuestArchitectureResult data={architecture} userPlan="free" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
