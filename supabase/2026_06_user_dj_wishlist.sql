-- TrackDJs Sprint 7A.2
-- DJ wishlist / "Quiero verlo" persistence.

create table if not exists public.user_dj_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dj_id uuid not null references public.djs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, dj_id)
);

create index if not exists idx_user_dj_wishlist_user_id on public.user_dj_wishlist(user_id);
create index if not exists idx_user_dj_wishlist_dj_id on public.user_dj_wishlist(dj_id);

alter table public.user_dj_wishlist enable row level security;

drop policy if exists "users read own wishlist" on public.user_dj_wishlist;
drop policy if exists "users create own wishlist" on public.user_dj_wishlist;
drop policy if exists "users delete own wishlist" on public.user_dj_wishlist;

create policy "users read own wishlist"
  on public.user_dj_wishlist for select
  using (auth.uid() = user_id);

create policy "users create own wishlist"
  on public.user_dj_wishlist for insert
  with check (auth.uid() = user_id);

create policy "users delete own wishlist"
  on public.user_dj_wishlist for delete
  using (auth.uid() = user_id);
