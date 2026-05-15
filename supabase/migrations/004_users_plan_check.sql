alter table users
  add constraint users_plan_check
  check (plan in ('free', 'blueprint', 'pro', 'team'));
