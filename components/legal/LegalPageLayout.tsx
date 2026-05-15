import Link from "next/link"
import { BrandWordmark } from "@/components/brand/BrandWordmark"
export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="landing-surface min-h-screen text-foreground">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <BrandWordmark textClassName="text-base" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-foreground/85">{children}</div>
        <p className="mt-12 border-t border-border pt-8 text-xs text-muted-foreground">
          Questions? Contact{" "}
          <a href="mailto:support@archivolt.dev" className="text-cyan-500 hover:underline">
            support@archivolt.dev
          </a>
          . This page is general information, not legal advice.
        </p>
        <p className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-cyan-500 hover:underline">
            ← Home
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">
            Terms
          </Link>
          <Link href="/refund" className="text-muted-foreground hover:text-foreground">
            Refunds
          </Link>
        </p>
      </main>
    </div>
  )
}
