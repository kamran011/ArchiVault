"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  PRICING_SCROLL_STORAGE_KEY,
  scrollToPricingSection,
} from "@/lib/pricing-scroll"

type PricingCtaLinkProps = {
  href: string
  className?: string
  children: React.ReactNode
}

function isHomePricingHash(href: string): boolean {
  return href === "/#pricing" || href.endsWith("#pricing")
}

/**
 * Navigate to homepage pricing reliably: smooth-scroll when already on `/`,
 * otherwise set a flag + `router.push` so [`ScrollPricingIntoViewOnMount`] on the landing page finishes the scroll.
 */
export function PricingCtaLink({ href, className, children }: PricingCtaLinkProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isHomeHash = isHomePricingHash(href)

  return (
    <Link
      href={href}
      scroll={false}
      className={className}
      onClick={(e) => {
        if (!isHomeHash) return
        if (pathname === "/") {
          e.preventDefault()
          scrollToPricingSection()
          return
        }
        e.preventDefault()
        try {
          sessionStorage.setItem(PRICING_SCROLL_STORAGE_KEY, "1")
        } catch {
          /* private mode etc. */
        }
        router.push("/pricing")
      }}
    >
      {children}
    </Link>
  )
}

/** Mount on the landing page (`app/page.tsx`) so `/dashboard` → `/#pricing` scrolls after navigation. */
export function ScrollPricingIntoViewOnMount() {
  React.useEffect(() => {
    const flagged =
      typeof window !== "undefined" &&
      sessionStorage.getItem(PRICING_SCROLL_STORAGE_KEY) === "1"
    const hashed = typeof window !== "undefined" && window.location.hash === "#pricing"
    if (!flagged && !hashed) return

    sessionStorage.removeItem(PRICING_SCROLL_STORAGE_KEY)

    const id = window.setTimeout(() => {
      scrollToPricingSection()
    }, 120)

    return () => window.clearTimeout(id)
  }, [])

  return null
}
