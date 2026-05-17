import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"
import { SupportEmailLink } from "@/components/shared/SupportEmailLink"

export const metadata: Metadata = {
  title: "Privacy Policy | Archivolt",
  description: "How Archivolt collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 15, 2026">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Summary</h2>
        <p>
          Archivolt (&quot;we&quot;) runs archivolt.dev. We collect only what we need to operate the product, protect
          accounts, and improve reliability. This page is a short overview; contact us for details or data requests.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">What we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Email and account data</strong> — from our authentication provider when you sign up.
          </li>
          <li>
            <strong>System descriptions</strong> — text you enter to generate architecture blueprints, and the outputs we
            store for your history and exports.
          </li>
          <li>
            <strong>Usage data</strong> — basic request metadata, errors, and limits enforcement (e.g. plan usage).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Sharing</h2>
        <p>
          We do not sell your personal information. We do not share it with third parties for their own marketing or
          unrelated purposes. Infrastructure services (e.g. hosting, auth, payments, AI inference) process data only as
          needed to run Archivolt, under appropriate agreements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">GDPR</h2>
        <p>
          If you are in the EEA/UK, we aim to process personal data lawfully and to honor requests for access, correction,
          deletion, or portability where applicable. Contact{" "}
          <SupportEmailLink showAddress linkClassName="text-cyan-500 hover:underline" /> to exercise your rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Contact</h2>
        <p className="flex flex-wrap items-center gap-1">
          Questions about this policy:{" "}
          <SupportEmailLink showAddress linkClassName="text-cyan-500 hover:underline" />.
        </p>
      </section>
    </LegalPageLayout>
  )
}
