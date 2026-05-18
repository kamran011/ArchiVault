export function GuestTryFormSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading form">
      <div className="h-4 w-56 rounded bg-muted animate-pulse" />
      <div className="min-h-[200px] rounded-lg border border-border bg-muted/60 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-9 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-9 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-9 rounded-lg bg-muted/60 animate-pulse" />
      </div>
      <div className="h-9 w-full max-w-xs rounded-lg bg-muted animate-pulse" />
    </div>
  )
}
