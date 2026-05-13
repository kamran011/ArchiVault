create extension if not exists "pgcrypto";

create table users (
  id uuid default gen_random_uuid() primary key,
  clerk_id text unique not null,
  email text,
  plan text default 'free',
  generation_count integer default 0,
  last_generation_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table generations (
  id uuid default gen_random_uuid() primary key,
  clerk_id text not null,
  description text not null,
  result jsonb not null,
  created_at timestamptz default now()
);

create index generations_clerk_id_idx on generations (clerk_id);
