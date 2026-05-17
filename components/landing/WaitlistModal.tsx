"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { CheckoutPlan } from "@/lib/plans"
import { waitlistLaunchTitle } from "@/lib/waitlist"

type WaitlistModalProps = {
  open: boolean
  plan: CheckoutPlan | null
  onOpenChange: (open: boolean) => void
}

export function WaitlistModal({ open, plan, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)
  const [submittedEmail, setSubmittedEmail] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      setEmail("")
      setSubmitting(false)
      setConfirmed(false)
      setSubmittedEmail("")
    }
  }, [open])

  if (!plan) return null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!plan || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), plan }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? "Could not join waitlist")
      }

      setSubmittedEmail(email.trim())
      setConfirmed(true)
      toast.success("Confirmation sent to your email")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join waitlist")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-cyan-500/20 bg-card p-6 shadow-2xl shadow-black/50",
            "transition duration-200 data-ending-style:scale-95 data-ending-style:opacity-0",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          {confirmed ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
                <Sparkles className="size-5 text-cyan-400" aria-hidden />
              </div>
              <DialogPrimitive.Title className="text-xl font-semibold text-foreground">
                You&apos;re on the list
              </DialogPrimitive.Title>
              <p className="text-sm text-muted-foreground">
                Confirmation sent to{" "}
                <span className="font-medium text-foreground">{submittedEmail}</span>
              </p>
              <Button
                type="button"
                className="w-full bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
              <div className="flex items-start gap-4">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10"
                  aria-hidden
                >
                  <Sparkles className="size-5 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <DialogPrimitive.Title className="text-xl font-semibold text-foreground">
                    {waitlistLaunchTitle(plan)}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-sm text-muted-foreground">
                    Get early-bird access when paid tiers go live. We&apos;ll email you before public launch.
                  </DialogPrimitive.Description>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waitlist-email">Email</Label>
                <input
                  id="waitlist-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40",
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
              >
                {submitting ? "Joining…" : "Join early-bird list (limited 50 spots)"}
              </Button>
            </form>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
