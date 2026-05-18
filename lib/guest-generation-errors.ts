/** User-facing copy when `guest_generations` insert fails. */
export function messageForGuestInsertFailure(err: { code?: string; message?: string } | null): string {
  const msg = (err?.message ?? "").toLowerCase()
  const code = err?.code ?? ""

  if (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("guest_generations") ||
    (msg.includes("relation") && msg.includes("does not exist")) ||
    (msg.includes("schema cache") && msg.includes("could not find"))
  ) {
    return "Guest saves are not set up yet (database table missing). In Supabase → SQL Editor, run the migration file supabase/migrations/006_guest_generations.sql, then try again."
  }

  if (code === "23514" || msg.includes("violates check constraint")) {
    return "Could not save this blueprint (data constraint). Try a shorter description or sign up to generate from your account."
  }

  return "Could not save your blueprint. Please try again or sign up to generate from your account."
}
