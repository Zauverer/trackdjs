-- TrackDJs Sprint 7A.2
-- Safe RLS refresh for personal user actions.

alter table public.user_dj_follows enable row level security;
alter table public.user_seen_djs enable row level security;
alter table public.user_event_status enable row level security;

alter table public.user_seen_djs
  add column if not exists verification_status text not null default 'self_reported';

drop policy if exists "users read own follows" on public.user_dj_follows;
drop policy if exists "users create own follows" on public.user_dj_follows;
drop policy if exists "users delete own follows" on public.user_dj_follows;

create policy "users read own follows" on public.user_dj_follows
  for select using (auth.uid() = user_id);
create policy "users create own follows" on public.user_dj_follows
  for insert with check (auth.uid() = user_id);
create policy "users delete own follows" on public.user_dj_follows
  for delete using (auth.uid() = user_id);

drop policy if exists "users read own seen djs" on public.user_seen_djs;
drop policy if exists "users create own seen djs" on public.user_seen_djs;
drop policy if exists "users update own seen djs" on public.user_seen_djs;
drop policy if exists "users delete own seen djs" on public.user_seen_djs;

create policy "users read own seen djs" on public.user_seen_djs
  for select using (auth.uid() = user_id);
create policy "users create own seen djs" on public.user_seen_djs
  for insert with check (auth.uid() = user_id);
create policy "users update own seen djs" on public.user_seen_djs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own seen djs" on public.user_seen_djs
  for delete using (auth.uid() = user_id);

drop policy if exists "users read own event statuses" on public.user_event_status;
drop policy if exists "users create own event statuses" on public.user_event_status;
drop policy if exists "users update own event statuses" on public.user_event_status;
drop policy if exists "users delete own event statuses" on public.user_event_status;

create policy "users read own event statuses" on public.user_event_status
  for select using (auth.uid() = user_id);
create policy "users create own event statuses" on public.user_event_status
  for insert with check (auth.uid() = user_id);
create policy "users update own event statuses" on public.user_event_status
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own event statuses" on public.user_event_status
  for delete using (auth.uid() = user_id);
