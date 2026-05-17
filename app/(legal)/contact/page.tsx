import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"
import { ContactEmail } from "@/components/legal/ContactEmail"

export const metadata: Metadata = {
  title: "Contact Us | Archivolt",
  description: "Contact Archivolt for support, feedback, sales, and privacy inquiries.",
}

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contact Us" lastUpdated="May 16, 2026">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Support</h2>
        <p>For billing, refunds, or account issues:</p>
        <ContactEmail />
        <p className="text-muted-foreground">Response time: Within 24 hours</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Feedback &amp; Feature Requests</h2>
        <p>Have an idea? Found a bug?</p>
        <ContactEmail mailtoSubject="Feedback: [topic]" />
        <p className="text-muted-foreground">
          Use subject line <span className="font-mono text-foreground/80">Feedback: [topic]</span> (replace{" "}
          <span className="font-mono">[topic]</span> with a short description).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Sales &amp; Partnerships</h2>
        <p>For agencies, bulk licensing, or partnerships:</p>
        <ContactEmail />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Data &amp; Privacy Questions</h2>
        <p>
          See our{" "}
          <Link href="/privacy" className="text-cyan-500 hover:underline">
            Privacy Policy
          </Link>{" "}
          for GDPR and data deletion requests.
        </p>
        <ContactEmail />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">General Inquiries</h2>
        <ContactEmail />
      </section>
    </LegalPageLayout>
  )
}
