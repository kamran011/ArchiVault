/** Subtle pulse shown on tab labels while an on-demand generation API runs. */
export function TabGeneratingIndicator() {
  return (
    <span
      className="inline-flex size-3.5 shrink-0 items-center justify-center"
      role="status"
      aria-label="Generating"
    >
      <span className="size-2 animate-pulse rounded-full bg-cyan-400/90" />
    </span>
  )
}
