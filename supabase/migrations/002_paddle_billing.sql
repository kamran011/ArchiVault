-- Paddle billing columns; remove Stripe columns
alter table users
  add column if not exists paddle_subscription_id text,
  add column if not exists paddle_customer_id text,
  add column if not exists subscription_status text,
  add column if not exists subscription_cancels_at timestamptz;

alter table users drop column if exists stripe_customer_id;
alter table users drop column if exists stripe_subscription_id;
