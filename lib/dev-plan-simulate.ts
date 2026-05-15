import type { UserPlan } from "@/lib/plan-gate"

const VALID_PLANS: UserPlan[] = ["free", "blueprint", "pro", "team"]

function isDev(): boolean {
  return process.env.NODE_ENV === "development"
}

/** Local-only plan override (set SIMULATE_USER_PLAN in .env.local). */
export function resolveSimulatedPlan(actual: UserPlan): UserPlan {
  if (!isDev()) return actual
  const raw = process.env.SIMULATE_USER_PLAN?.trim().toLowerCase()
  if (!raw) return actual
  if (VALID_PLANS.includes(raw as UserPlan)) return raw as UserPlan
  return actual
}

/** Optional override for generation_count gate checks (SIMULATE_GENERATION_COUNT). */
export function resolveSimulatedGenerationCount(actual: number): number {
  if (!isDev()) return actual
  const raw = process.env.SIMULATE_GENERATION_COUNT?.trim()
  if (!raw) return actual
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : actual
}

export function isPlanSimulationActive(): boolean {
  return isDev() && Boolean(process.env.SIMULATE_USER_PLAN?.trim())
}
