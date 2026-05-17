import type { CheckoutPlan } from "@/lib/plans"

export async function startCheckout(plan: CheckoutPlan): Promise<string> {
  const res = await fetch("/api/paddle/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  })
  const data = (await res.json()) as { url?: string; error?: string }
  if (!res.ok) throw new Error(data.error ?? "Checkout failed")
  if (!data.url) throw new Error("No checkout URL returned")
  return data.url
}
