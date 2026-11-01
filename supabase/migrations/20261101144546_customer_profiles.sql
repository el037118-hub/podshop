create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  payment_method text not null default '',
  observations text not null default '',
  created_at timestamptz not null default now(),
  constraint customer_profiles_full_name_length check (char_length(full_name) between 1 and 120),
  constraint customer_profiles_phone_length check (char_length(phone) <= 40),
  constraint customer_profiles_address_length check (char_length(address) <= 500),
  constraint customer_profiles_payment_method_length check (char_length(payment_method) <= 80),
  constraint customer_profiles_observations_length check (char_length(observations) <= 1000)
);

alter table public.customer_profiles enable row level security;

revoke all on table public.customer_profiles from public, anon, authenticated;
grant select on table public.customer_profiles to authenticated;
grant insert (user_id, full_name, phone, address, payment_method, observations)
  on table public.customer_profiles to authenticated;
grant update (user_id, full_name, phone, address, payment_method, observations)
  on table public.customer_profiles to authenticated;

drop policy if exists customer_profiles_select_own on public.customer_profiles;
create policy customer_profiles_select_own on public.customer_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists customer_profiles_insert_own on public.customer_profiles;
create policy customer_profiles_insert_own on public.customer_profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists customer_profiles_update_own on public.customer_profiles;
create policy customer_profiles_update_own on public.customer_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
