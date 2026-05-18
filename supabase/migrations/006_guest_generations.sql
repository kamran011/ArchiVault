create table if not exists guest_generations (
  id uuid default gen_random_uuid() primary key,
  guest_token text not null unique,
  ip_hash text,
  description text not null,
  result jsonb not null,
  claimed_by_clerk_id text,
  created_at timestamptz default now()
);

create index if not exists guest_generations_ip_hash_created_idx
  on guest_generations (ip_hash, created_at desc);
