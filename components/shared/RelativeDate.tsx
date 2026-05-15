"use client"

import * as React from "react"
import { formatRelativeDate } from "@/lib/format-relative-date"

export function RelativeDate({
  dateString,
  className,
}: {
  dateString: string
  className?: string
}) {
  const [label, setLabel] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLabel(formatRelativeDate(dateString))
  }, [dateString])

  return <span className={className}>{label ?? "\u00a0"}</span>
}
