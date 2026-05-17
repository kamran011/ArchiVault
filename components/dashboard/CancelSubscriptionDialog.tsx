"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatSubscriptionCancelDate, planDisplayName } from "@/lib/format-subscription-date"
import type { UserPlan } from "@/lib/plan-gate"

type CancelSubscriptionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userPlan: UserPlan
  subscriptionCancelsAt: string | null
  features: string[]
  onConfirm: () => Promise<void>
  confirming: boolean
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  userPlan,
  subscriptionCancelsAt,
  features,
  onConfirm,
  confirming,
}: CancelSubscriptionDialogProps) {
  const dateLabel = formatSubscriptionCancelDate(subscriptionCancelsAt)
  const planLabel = planDisplayName(userPlan)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                You&apos;ll lose access to your <strong className="text-foreground">{planLabel}</strong>{" "}
                benefits when your current period ends
                {subscriptionCancelsAt ? (
                  <>
                    {" "}
                    on <strong className="text-foreground">{dateLabel}</strong>
                  </>
                ) : (
                  <> at the end of your billing period</>
                )}
                :
              </p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>Keep subscription</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirming}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault()
              void onConfirm()
            }}
          >
            {confirming ? "Canceling…" : "Cancel plan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
