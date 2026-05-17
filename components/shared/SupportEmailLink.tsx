"use client"

import { toast } from "sonner"
import { cn } from "@/lib/utils"

export const SUPPORT_EMAIL = "support@archivolt.dev"

export async function copySupportEmail() {
  try {
    await navigator.clipboard.writeText(SUPPORT_EMAIL)
    toast.success("Email copied to clipboard")
  } catch {
    toast.error("Could not copy email")
  }
}

type SupportEmailLinkProps = {
  /** Link label; defaults to "Email us". Use `showAddress` to show the address instead. */
  label?: string
  showAddress?: boolean
  mailtoSubject?: string
  className?: string
  linkClassName?: string
}

export function SupportEmailLink({
  label = "Email us",
  showAddress = false,
  mailtoSubject,
  className,
  linkClassName,
}: SupportEmailLinkProps) {
  const mailto = mailtoSubject
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(mailtoSubject)}`
    : `mailto:${SUPPORT_EMAIL}`

  return (
    <a
      href={mailto}
      onClick={() => void copySupportEmail()}
      className={cn(
        "inline text-cyan-400 transition-colors hover:text-cyan-300",
        linkClassName,
        className,
      )}
    >
      {showAddress ? SUPPORT_EMAIL : label}
    </a>
  )
}
