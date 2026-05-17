import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { BrandWordmark } from "@/components/brand/BrandWordmark"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandWordmark logoSize={22} textClassName="text-base" />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Studio
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  )
}
