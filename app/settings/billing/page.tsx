import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { BillingSettings } from "@/components/settings/BillingSettings"

export default async function BillingSettingsPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in?redirect_url=/settings/billing")
  }

  return <BillingSettings />
}
