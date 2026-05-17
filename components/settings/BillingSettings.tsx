"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown, CreditCard, RefreshCw, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { CancelSubscriptionDialog } from "@/components/dashboard/CancelSubscriptionDialog"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { UserPlan } from "@/lib/plan-gate"
import {
  isRecurringSubscription,
  planFeatures,
  planHeadline,
  planPriceLabel,
  pricingTierForPlan,
} from "@/lib/billing-display"
import { formatSubscriptionCancelDate, planDisplayName } from "@/lib/format-subscription-date"
import { nextUpgradePlan } from "@/lib/plans"
import { startCheckout } from "@/lib/billing/checkout"

export function BillingSettings() {
  const [userPlan, setUserPlan] = React.useState<UserPlan>("free")
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<string | null>(null)
  const [subscriptionCancelsAt, setSubscriptionCancelsAt] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [manageOpen, setManageOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [canceling, setCanceling] = React.useState(false)
  const [portalLoading, setPortalLoading] = React.useState(false)
  const [checkoutLoading, setCheckoutLoading] = React.useState(false)

  const loadPlan = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/plan")
      const body = await res.json()
      if (res.ok) {
        if (body?.plan) setUserPlan(body.plan as UserPlan)
        setSubscriptionStatus((body.subscriptionStatus as string | null) ?? null)
        setSubscriptionCancelsAt((body.subscriptionCancelsAt as string | null) ?? null)
      }
    } catch {
      toast.error("Could not load billing details")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadPlan()
  }, [loadPlan])

  const tier = pricingTierForPlan(userPlan)
  const features = planFeatures(userPlan)
  const recurring = isRecurringSubscription(userPlan)
  const isScheduledCancel = subscriptionStatus === "scheduled_cancellation"
  const showManageSubscription = recurring
  const showCancelAction = recurring && !isScheduledCancel
  const upgradePlan = nextUpgradePlan(userPlan)

  async function handleCustomerPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/polar/customer-portal", { method: "POST" })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not open billing portal")
      window.location.href = data.url
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open billing portal")
    } finally {
      setPortalLoading(false)
    }
  }

  async function handleUpgrade() {
    if (!upgradePlan) return
    setCheckoutLoading(true)
    try {
      const url = await startCheckout(upgradePlan)
      window.location.href = url
    } catch {
      toast.error("Checkout could not be started")
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleCancelConfirm() {
    setCanceling(true)
    try {
      const res = await fetch("/api/polar/cancel-subscription", { method: "POST" })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Could not cancel subscription")
      toast.success("Subscription scheduled to cancel")
      setCancelOpen(false)
      setManageOpen(false)
      await loadPlan()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel subscription")
    } finally {
      setCanceling(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View your plan, update payment details, or change your subscription.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ) : (
        <>
          {isScheduledCancel && subscriptionCancelsAt ? (
            <div
              role="status"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
            >
              Your subscription cancels on{" "}
              <strong>{formatSubscriptionCancelDate(subscriptionCancelsAt)}</strong>. You keep{" "}
              <strong>{planDisplayName(userPlan)}</strong> access until then.
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{planHeadline(userPlan)}</CardTitle>
                  <CardDescription className="mt-1">
                    {tier?.description ?? "Your current Archivolt access level."}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="shrink-0 text-sm font-medium">
                  {planPriceLabel(userPlan)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-cyan-500/80" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {showManageSubscription ? (
            <Card>
              <CardHeader className="pb-3">
                <button
                  type="button"
                  onClick={() => setManageOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={manageOpen}
                >
                  <div>
                    <CardTitle className="text-base">Manage subscription</CardTitle>
                    <CardDescription className="mt-0.5">
                      Change plan, payment method, or cancel
                    </CardDescription>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform",
                      manageOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
              </CardHeader>

              {manageOpen ? (
                <CardContent className="space-y-1 pt-0">
                  <Separator className="mb-3" />
                  {upgradePlan ? (
                    <button
                      type="button"
                      disabled={checkoutLoading}
                      onClick={() => void handleUpgrade()}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <RefreshCw className="size-4 text-muted-foreground" aria-hidden />
                      <span>
                        <span className="font-medium text-foreground">Change plan</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          Upgrade or switch tiers
                        </span>
                      </span>
                    </button>
                  ) : (
                    <Link
                      href="/pricing"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <RefreshCw className="size-4 text-muted-foreground" aria-hidden />
                      <span>
                        <span className="font-medium text-foreground">Change plan</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          View all plans on the pricing page
                        </span>
                      </span>
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={portalLoading}
                    onClick={() => void handleCustomerPortal()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <CreditCard className="size-4 text-muted-foreground" aria-hidden />
                    <span>
                      <span className="font-medium text-foreground">Update payment method</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Opens secure Polar billing portal
                      </span>
                    </span>
                  </button>

                  {showCancelAction ? (
                    <>
                      <Separator className="my-2" />
                      <button
                        type="button"
                        onClick={() => setCancelOpen(true)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <span className="font-medium">Cancel plan</span>
                      </button>
                    </>
                  ) : null}
                </CardContent>
              ) : null}
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need a subscription?</CardTitle>
                <CardDescription>
                  Upgrade for more generations, exports, and advanced tabs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing" className={buttonVariants({ variant: "default" })}>
                  View plans
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <CancelSubscriptionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        userPlan={userPlan}
        subscriptionCancelsAt={subscriptionCancelsAt}
        features={features}
        onConfirm={handleCancelConfirm}
        confirming={canceling}
      />
    </div>
  )
}
