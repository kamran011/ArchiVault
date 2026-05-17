"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isDevTestCheckoutAvailable, TEST_CHECKOUT_PLAN } from "@/lib/plans"
import { startCheckout } from "@/lib/billing/checkout"
import { toast } from "sonner"

type DevTestCheckoutButtonProps = {
  className?: string
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
}

export function DevTestCheckoutButton({
  className,
  variant = "outline",
  size = "sm",
  fullWidth = false,
}: DevTestCheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false)

  if (!isDevTestCheckoutAvailable()) return null

  async function handleClick() {
    setLoading(true)
    try {
      const url = await startCheckout(TEST_CHECKOUT_PLAN)
      window.location.href = url
    } catch (e) {
      const message = e instanceof Error ? e.message : "Checkout failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={loading}
      className={cn(fullWidth && "w-full", className)}
      onClick={() => void handleClick()}
    >
      {loading ? "Redirecting…" : "Pay $2 (test checkout)"}
    </Button>
  )
}
