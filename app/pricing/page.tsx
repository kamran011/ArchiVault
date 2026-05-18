import type { Metadata } from "next"
import { AuthNav } from "@/components/shared/AuthNav"
import { BrandWordmark } from "@/components/brand/BrandWordmark"
import { PricingSection } from "@/components/landing/PricingSection"
import { SiteFooter } from "@/components/shared/SiteFooter"
import { siteContainerClass, siteGutterClass } from "@/lib/site-layout"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Pricing | Archivolt",
  description: "Blueprint, Pro, and Team plans for architecture generation.",
}

export default function PricingPage() {
  return (
    <div className="landing-surface min-h-screen text-foreground">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className={siteGutterClass}>
          <div className={cn(siteContainerClass, "flex h-16 items-center justify-between")}>
            <BrandWordmark
              textClassName="text-lg"
              logoSize={28}
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            />
            <AuthNav variant="landing" />
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <PricingSection id="pricing" className="border-t-0" />
      </main>

      <SiteFooter />
    </div>
  )
}
