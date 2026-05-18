import type { SupabaseClient } from "@supabase/supabase-js"
import type { UserPlan } from "@/lib/plan-gate"
import { generationLimitForPlan, isGenerationAllowed } from "@/lib/plans"

export type QuotaReserveResult =
  | { ok: true; previousCount: number; newCount: number }
  | { ok: false; reason: "limit_reached" | "contention" | "db_error" }

const MAX_RESERVE_RETRIES = 3

/**
 * Atomically reserves one generation slot (optimistic lock on generation_count).
 * Prevents parallel requests from each inserting when the plan cap would allow only one more.
 */
export async function reserveGenerationSlot(
  supabase: SupabaseClient,
  userId: string,
  plan: UserPlan,
  currentCount: number,
): Promise<QuotaReserveResult> {
  if (!isGenerationAllowed(plan, currentCount)) {
    return { ok: false, reason: "limit_reached" }
  }

  const limit = generationLimitForPlan(plan)
  const timestamp = new Date().toISOString()

  if (limit === null) {
    const newCount = currentCount + 1
    const { error } = await supabase
      .from("users")
      .update({ generation_count: newCount, last_generation_at: timestamp })
      .eq("clerk_id", userId)

    if (error) {
      console.error(error)
      return { ok: false, reason: "db_error" }
    }

    return { ok: true, previousCount: currentCount, newCount }
  }

  for (let attempt = 0; attempt < MAX_RESERVE_RETRIES; attempt++) {
    const { data: userRow, error: readErr } = await supabase
      .from("users")
      .select("generation_count")
      .eq("clerk_id", userId)
      .maybeSingle()

    if (readErr) {
      console.error(readErr)
      return { ok: false, reason: "db_error" }
    }

    const count = userRow?.generation_count ?? 0
    if (!isGenerationAllowed(plan, count)) {
      return { ok: false, reason: "limit_reached" }
    }

    const nextCount = count + 1
    const { data: updated, error: updErr } = await supabase
      .from("users")
      .update({ generation_count: nextCount, last_generation_at: timestamp })
      .eq("clerk_id", userId)
      .eq("generation_count", count)
      .select("generation_count")
      .maybeSingle()

    if (updErr) {
      console.error(updErr)
      return { ok: false, reason: "db_error" }
    }

    if (updated) {
      return { ok: true, previousCount: count, newCount: nextCount }
    }
  }

  return { ok: false, reason: "contention" }
}

/** Restores quota after a failed generation (only if count still matches reserved value). */
export async function releaseGenerationSlot(
  supabase: SupabaseClient,
  userId: string,
  previousCount: number,
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({
      generation_count: previousCount,
      ...(previousCount === 0 ? { last_generation_at: null } : {}),
    })
    .eq("clerk_id", userId)
    .eq("generation_count", previousCount + 1)

  if (error) {
    console.error("releaseGenerationSlot:", error)
  }
}
