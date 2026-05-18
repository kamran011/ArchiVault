# Conversion baseline (homepage uplift)

Use this to compare after deploy (Vercel Analytics → Events, Clerk → Users).

**Baseline (pre-change):** ~14 site visitors, 0 non-internal sign-ups (internal test accounts excluded when `ARCHIVOLT_INTERNAL_EMAILS` is set on Vercel).

**Events instrumented:** `cta_hero_signup`, `cta_hero_guest`, `cta_hero_see_example`, `cta_nav_signup`, `cta_example_signup`, `cta_example_guest`, `guest_generation_started`, `guest_generation_completed`, `guest_signup_prompt_click`, `guest_claim_completed`, `sign_up_completed` (fires with `guest_claim_completed` when a guest blueprint is saved after sign-up).

**2-week check:** Compare event counts to unique visitors; add `ARCHIVOLT_INTERNAL_EMAILS` and `NEXT_PUBLIC_SOCIAL_PROOF_VISITORS` in Vercel Production if not already set.

## Guest try (`/try`) — Supabase

The `guest_generations` table must exist on the **same** Supabase project as `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` on Vercel. If guest generation streams then ends with a save error, apply:

`supabase/migrations/006_guest_generations.sql`

In **Supabase Dashboard → SQL Editor** (production project), paste and run the file contents, or use `supabase db push` / your migration pipeline.
