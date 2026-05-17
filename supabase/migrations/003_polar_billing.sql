-- Polar billing columns; remove Paddle columns
alter table users
  add column if not exists polar_subscription_id text,
  add column if not exists polar_customer_id text;

alter table users drop column if exists paddle_subscription_id;
alter table users drop column if exists paddle_customer_id;
