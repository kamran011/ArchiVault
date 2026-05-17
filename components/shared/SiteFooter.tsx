import Link from "next/link"
import { BrandWordmark } from "@/components/brand/BrandWordmark"
import { siteContainerClass, siteGutterClass } from "@/lib/site-layout"
import { cn } from "@/lib/utils"

export function SiteFooter() {
  return (
    <footer className={cn("border-t border-border py-8", siteGutterClass)}>
      <div className={cn(siteContainerClass, "flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between")}>
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
          <Link href="/refund" className="hover:text-foreground">
            Refunds
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </div>
        <p className="text-xs text-muted-foreground/70">© {new Date().getFullYear()} Archivolt</p>
      </div>
    </footer>
  )
}
