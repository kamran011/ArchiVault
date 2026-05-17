"use client"

import { SupportEmailLink } from "@/components/shared/SupportEmailLink"

type ContactEmailProps = {
  mailtoSubject?: string
}

export function ContactEmail({ mailtoSubject }: ContactEmailProps) {
  return (
    <p className="flex flex-wrap items-center gap-1">
      <span className="text-muted-foreground">Email:</span>
      <SupportEmailLink
        showAddress
        mailtoSubject={mailtoSubject}
        linkClassName="font-medium text-cyan-500 hover:underline"
      />
    </p>
  )
}
