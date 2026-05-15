/** Set before client-navigating from other routes so the home page can smooth-scroll to pricing after paint. */
export const PRICING_SCROLL_STORAGE_KEY = "archivolt-scroll-pricing"

export function scrollToPricingSection(options?: ScrollIntoViewOptions) {
  if (typeof document === "undefined") return
  document.getElementById("pricing")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
    ...options,
  })
}
