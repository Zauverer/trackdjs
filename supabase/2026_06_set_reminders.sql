-- TrackDJs Sprint 7A.2
-- Set reminder intent persistence. No push notifications yet.

create table if not exists public.set_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  dj_id uuid references public.djs(id) on delete set null,
  stage_name text,
  start_time timestamptz,
  reminder_key text,
  remind_minutes_before integer not null default 15,
  created_at timestamptz not null default now(),
  unique (user_id, reminder_key)
);

create index if not exists idx_set_reminders_user_id on public.set_reminders(user_id);
create index if not exists idx_set_reminders_event_id on public.set_reminders(event_id);

alter table public.set_reminders enable row level security;

drop policy if exists "users read own set reminders" on public.set_reminders;
drop policy if exists "users create own set reminders" on public.set_reminders;
drop policy if exists "users update own set reminders" on public.set_reminders;
drop policy if exists "users delete own set reminders" on public.set_reminders;

create policy "users read own set reminders"
  on public.set_reminders for select
  using (auth.uid() = user_id);

create policy "users create own set reminders"
  on public.set_reminders for insert
  with check (auth.uid() = user_id);

create policy "users update own set reminders"
  on public.set_reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own set reminders"
  on public.set_reminders for delete
  using (auth.uid() = user_id);
