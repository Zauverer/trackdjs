-- TrackDJs profile RLS fix
-- Safe to run more than once in Supabase SQL Editor.

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;

create policy "profiles are publicly readable"
  on public.profiles
  for select
  using (true);

create policy "users insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "users update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
