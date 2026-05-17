import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"
import { SupportEmailLink } from "@/components/shared/SupportEmailLink"

export const metadata: Metadata = {
  title: "Refund Policy | Archivolt",
  description: "Refunds and cancellations for Archivolt plans.",
}

export default function RefundPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="May 15, 2026">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">30-day refund</h2>
        <p>
          For paid <strong>Blueprint</strong> (one-time), <strong>Pro</strong>, and <strong>Team</strong> purchases, you
          may request a full refund within <strong>30 days</strong> of the charge if you are not satisfied. Contact us at{" "}
          <SupportEmailLink showAddress linkClassName="text-cyan-500 hover:underline" /> with your account email and approximate purchase date. We will confirm eligibility and process approved refunds
          to the original payment method where possible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Subscriptions</h2>
        <p>
          <strong>Pro</strong> and <strong>Team</strong> are subscriptions. You may cancel at any time from the
          Architecture studio sidebar (<strong>Cancel subscription</strong>) or by contacting support. Cancellation
          stops future renewals; you generally retain access until the end of the current billing period unless we agree
          otherwise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Exceptions</h2>
        <p>
          We may deny refunds where required by law, where abuse or chargebacks apply, or where a refund was already issued
          for the same purchase. This policy does not limit any non-waivable consumer rights in your jurisdiction.
        </p>
      </section>
    </LegalPageLayout>
  )
}
