import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"

export const metadata: Metadata = {
  title: "Terms of Service | Archivolt",
  description: "Terms governing use of Archivolt.",
}

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="May 14, 2026">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Agreement</h2>
        <p>
          By accessing or using Archivolt at archivolt.dev, you agree to these Terms. If you do not agree, do not use the
          service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Service</h2>
        <p>
          Archivolt provides AI-assisted software architecture blueprints based on Volatility-Based Decomposition. Output
          is for planning and education; you are responsible for validating designs before production use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Accounts &amp; plans</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide accurate account information and keep credentials secure.</li>
          <li>
            Free, Blueprint (one-time), Pro, and Team plans include different generation limits and features as described
            on our pricing page.
          </li>
          <li>Subscriptions renew until canceled in Stripe or your billing portal. One-time Blueprint purchases do not
            auto-renew.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Abuse rate limits, scrape, or attempt to disrupt the service.</li>
          <li>Submit unlawful content or infringe others&apos; rights.</li>
          <li>Reverse engineer or resell the service without permission.</li>
          <li>Use the service to generate malware or harmful systems.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Intellectual property</h2>
        <p>
          You retain rights to briefs you submit. You receive a license to use outputs you generate for your projects.
          Archivolt retains rights in the product, brand, and underlying software. AI outputs may not be unique; similar
          results can occur for other users.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Disclaimer</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, OR NON-INFRINGEMENT. ARCHITECTURE SUGGESTIONS ARE NOT A SUBSTITUTE FOR PROFESSIONAL ENGINEERING OR
          LEGAL REVIEW.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, ARCHIVOLT AND ITS OPERATORS ARE NOT LIABLE FOR INDIRECT, INCIDENTAL,
          SPECIAL, OR CONSEQUENTIAL DAMAGES, OR FOR LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY
          CLAIM IS LIMITED TO THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Termination</h2>
        <p>
          We may suspend or terminate access for violation of these Terms or for operational reasons. You may stop using
          the service at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Governing law</h2>
        <p>
          These Terms are governed by the laws applicable in our place of business, without regard to conflict-of-law
          rules. Disputes will be resolved in the courts of that jurisdiction unless otherwise required by law.
        </p>
      </section>
    </LegalPageLayout>
  )
}
