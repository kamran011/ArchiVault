-- Early-bird waitlist for paid tiers (pre-checkout launch).
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  plan text not null check (plan in ('blueprint', 'pro', 'team')),
  created_at timestamptz default now() not null,
  constraint waitlist_email_plan_unique unique (email, plan)
);

create index waitlist_created_at_idx on waitlist (created_at);
create index waitlist_email_idx on waitlist (email);

comment on table waitlist is 'Pre-launch signups from pricing waitlist modal';
