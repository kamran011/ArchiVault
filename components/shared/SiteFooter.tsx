import Link from "next/link"
import { BrandWordmark } from "@/components/brand/BrandWordmark"

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <BrandWordmark asLink logoSize={20} textClassName="text-sm" />
          <p className="text-xs text-muted-foreground">Volatility-Based Decomposition for software teams</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <a href="mailto:legal@archivolt.dev" className="hover:text-foreground">
            Contact
          </a>
        </div>
        <p className="text-xs text-muted-foreground/70">© {new Date().getFullYear()} Archivolt</p>
      </div>
    </footer>
  )
}
