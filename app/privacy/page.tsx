import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"

export const metadata: Metadata = {
  title: "Privacy Policy | Archivolt",
  description: "How Archivolt collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 14, 2026">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Overview</h2>
        <p>
          Archivolt (&quot;we&quot;, &quot;us&quot;) operates archivolt.dev, a service that turns system briefs into
          volatility-based architecture blueprints. This policy describes what we collect, why we collect it, and your
          choices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account data</strong> — email and profile information from our authentication provider (Clerk) when
            you sign up.
          </li>
          <li>
            <strong>Content you submit</strong> — system descriptions, tech stack preferences, and generated architecture
            outputs stored to provide history and exports.
          </li>
          <li>
            <strong>Payment data</strong> — billing is processed by Stripe; we do not store full card numbers.
          </li>
          <li>
            <strong>Usage &amp; logs</strong> — request metadata, errors, and rate-limit counters needed to operate and
            secure the service.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">How we use information</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Generate and store architecture blueprints you request.</li>
          <li>Authenticate you, enforce plan limits, and process subscriptions or one-time purchases.</li>
          <li>Improve reliability, prevent abuse, and support customers.</li>
          <li>Send transactional messages related to your account (e.g. billing via Stripe).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">AI processing</h2>
        <p>
          Your system briefs are sent to third-party AI providers (e.g. Anthropic) to produce architecture output. Do
          not submit secrets, credentials, or personal data you are not authorized to share. Provider terms and data
          handling apply to those subprocessors.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Sharing</h2>
        <p>
          We use service providers for authentication (Clerk), database hosting (Supabase), payments (Stripe), and AI
          inference. We do not sell your personal information. We may disclose information if required by law or to
          protect rights and safety.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Retention</h2>
        <p>
          Account and generation history are kept while your account is active. You may request deletion by contacting
          us; some records may be retained where required for legal or billing obligations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Your rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or export personal data. Contact
          legal@archivolt.dev to exercise these rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Changes</h2>
        <p>We may update this policy; the &quot;Last updated&quot; date will change when we do.</p>
      </section>
    </LegalPageLayout>
  )
}
