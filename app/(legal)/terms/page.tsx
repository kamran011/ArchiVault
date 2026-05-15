import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"

export const metadata: Metadata = {
  title: "Terms of Service | Archivolt",
  description: "Terms governing use of Archivolt.",
}

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="May 15, 2026">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Agreement</h2>
        <p>
          By using Archivolt at archivolt.dev, you agree to these Terms. If you do not agree, do not use the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Lawful use</h2>
        <p>
          You agree to use Archivolt only for lawful purposes and in line with applicable rules. You will not misuse the
          service, attempt to disrupt it, or use it to generate harmful or illegal content.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Enforcement</h2>
        <p>
          We may suspend or terminate access if we reasonably believe there is abuse, risk to others, or a violation of
          these Terms, subject to applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">No warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;, WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. AI-generated architecture output is
          informational; you are responsible for review before relying on it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Limitation of liability</h2>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR INDIRECT OR CONSEQUENTIAL DAMAGES, OR FOR DAMAGES
          EXCEEDING WHAT YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM, WHERE ALLOWED.
        </p>
      </section>
    </LegalPageLayout>
  )
}
