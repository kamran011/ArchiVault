# Conversion baseline (homepage uplift)

Use this to compare after deploy (Vercel Analytics → Events, Clerk → Users).

**Baseline (pre-change):** ~14 site visitors, 0 non-internal sign-ups (internal test accounts excluded when `ARCHIVOLT_INTERNAL_EMAILS` is set on Vercel).

**Events instrumented:** `cta_hero_signup`, `cta_hero_guest`, `cta_hero_see_example`, `cta_nav_signup`, `cta_example_signup`, `cta_example_guest`, `guest_generation_started`, `guest_generation_completed`, `guest_signup_prompt_click`, `guest_claim_completed`, `sign_up_completed` (fires with `guest_claim_completed` when a guest blueprint is saved after sign-up).

**2-week check:** Compare event counts to unique visitors; add `ARCHIVOLT_INTERNAL_EMAILS` and `NEXT_PUBLIC_SOCIAL_PROOF_VISITORS` in Vercel Production if not already set.
