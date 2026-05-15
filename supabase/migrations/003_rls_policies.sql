-- Tier 2: defense-in-depth RLS
-- API routes use service role key and bypass RLS.
-- Anon/authenticated direct DB access is denied by default (no permissive policies).

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies for anon/authenticated roles.
-- If client-side Supabase is added later, add Clerk-JWT-based policies then.
