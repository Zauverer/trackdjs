-- Deploy in Supabase SQL Editor before activating account persistence.
-- TrackDJs Creamfields 2026: data minimization and owner-only access.
create table if not exists public.festival_lineups (
  user_id uuid not null references auth.users(id) on delete cascade,
  festival_key text not null default 'creamfields-chile-2026'
    check (festival_key = 'creamfields-chile-2026'),
  selected_ids text[] not null default '{}',
  maybe_ids text[] not null default '{}',
  no_ids text[] not null default '{}',
  favorite_styles text[] not null default '{}',
  privacy_notice_version text not null default '2026-11-12',
  beta_agreement_version text not null default '2026-11-12',
  consent_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id,festival_key),
  constraint set_ids_limited check (
    cardinality(selected_ids) <= 86 and
    cardinality(maybe_ids) <= 86 and
    cardinality(no_ids) <= 86 and
    cardinality(favorite_styles) <= 10
  )
);
create index if not exists festival_lineups_user_idx on public.festival_lineups(user_id);
alter table public.festival_lineups enable row level security;
revoke all on public.festival_lineups from anon;
grant select,insert,update,delete on public.festival_lineups to authenticated;
drop policy if exists "read own festival lineup" on public.festival_lineups;
drop policy if exists "insert own festival lineup" on public.festival_lineups;
drop policy if exists "update own festival lineup" on public.festival_lineups;
drop policy if exists "delete own festival lineup" on public.festival_lineups;
create policy "read own festival lineup"
  on public.festival_lineups for select to authenticated using (auth.uid() = user_id);
create policy "insert own festival lineup"
  on public.festival_lineups for insert to authenticated with check (auth.uid() = user_id);
create policy "update own festival lineup"
  on public.festival_lineups for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own festival lineup"
  on public.festival_lineups for delete to authenticated using (auth.uid() = user_id);
