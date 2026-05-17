/** Format ISO date for cancel UI, e.g. "April 15, 2026". */
export function formatSubscriptionCancelDate(iso: string | null | undefined): string {
  if (!iso) return "the end of your billing period"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "the end of your billing period"
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

export function planDisplayName(plan: string): string {
  if (plan === "pro") return "Pro"
  if (plan === "team") return "Team"
  if (plan === "blueprint") return "Blueprint"
  return "Free"
}
