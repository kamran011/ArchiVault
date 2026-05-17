"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatSubscriptionCancelDate, planDisplayName } from "@/lib/format-subscription-date";
import type { UserPlan } from "@/lib/plan-gate";

type CancelSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPlan: UserPlan;
  subscriptionCancelsAt: string | null;
  onConfirm: () => Promise<void>;
  confirming: boolean;
};

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  userPlan,
  subscriptionCancelsAt,
  onConfirm,
  confirming,
}: CancelSubscriptionDialogProps) {
  const dateLabel = formatSubscriptionCancelDate(subscriptionCancelsAt);
  const planLabel = planDisplayName(userPlan);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p>
              Your subscription will cancel at the end of your current billing period (
              <strong>{dateLabel}</strong>). You&apos;ll keep <strong>{planLabel}</strong> access until
              then.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>Keep subscription</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirming}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            {confirming ? "Canceling…" : "Confirm cancellation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
