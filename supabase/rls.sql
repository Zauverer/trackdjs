alter table public.profiles enable row level security;
alter table public.djs enable row level security;
alter table public.venues enable row level security;
alter table public.producers enable row level security;
alter table public.events enable row level security;
alter table public.event_lineup enable row level security;
alter table public.user_dj_follows enable row level security;
alter table public.user_seen_djs enable row level security;
alter table public.user_event_status enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.activity_events enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles are publicly readable" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "djs are publicly readable" on public.djs;
drop policy if exists "admins create djs" on public.djs;
drop policy if exists "admins or claimed djs update" on public.djs;
create policy "djs are publicly readable" on public.djs for select using (true);
create policy "admins create djs" on public.djs for insert with check (public.is_admin());
create policy "admins or claimed djs update" on public.djs for update using (public.is_admin() or claimed_by = auth.uid()) with check (public.is_admin() or claimed_by = auth.uid());

drop policy if exists "venues are publicly readable" on public.venues;
drop policy if exists "admins create venues" on public.venues;
drop policy if exists "admins update venues" on public.venues;
create policy "venues are publicly readable" on public.venues for select using (true);
create policy "admins create venues" on public.venues for insert with check (public.is_admin());
create policy "admins update venues" on public.venues for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "producers are publicly readable" on public.producers;
drop policy if exists "admins create producers" on public.producers;
drop policy if exists "admins or claimed producers update" on public.producers;
create policy "producers are publicly readable" on public.producers for select using (true);
create policy "admins create producers" on public.producers for insert with check (public.is_admin());
create policy "admins or claimed producers update" on public.producers for update using (public.is_admin() or claimed_by = auth.uid()) with check (public.is_admin() or claimed_by = auth.uid());

drop policy if exists "events are publicly readable" on public.events;
drop policy if exists "admins create events" on public.events;
drop policy if exists "admins or creators update events" on public.events;
create policy "events are publicly readable" on public.events for select using (true);
create policy "admins create events" on public.events for insert with check (public.is_admin() or created_by = auth.uid());
create policy "admins or creators update events" on public.events for update using (public.is_admin() or created_by = auth.uid()) with check (public.is_admin() or created_by = auth.uid());

drop policy if exists "lineups are publicly readable" on public.event_lineup;
drop policy if exists "admins manage lineups" on public.event_lineup;
create policy "lineups are publicly readable" on public.event_lineup for select using (true);
create policy "admins manage lineups" on public.event_lineup for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read own follows" on public.user_dj_follows;
drop policy if exists "users create own follows" on public.user_dj_follows;
drop policy if exists "users delete own follows" on public.user_dj_follows;
create policy "users read own follows" on public.user_dj_follows for select using (auth.uid() = user_id);
create policy "users create own follows" on public.user_dj_follows for insert with check (auth.uid() = user_id);
create policy "users delete own follows" on public.user_dj_follows for delete using (auth.uid() = user_id);

drop policy if exists "users read own seen djs" on public.user_seen_djs;
drop policy if exists "users create own seen djs" on public.user_seen_djs;
drop policy if exists "users update own seen djs" on public.user_seen_djs;
drop policy if exists "users delete own seen djs" on public.user_seen_djs;
create policy "users read own seen djs" on public.user_seen_djs for select using (auth.uid() = user_id);
create policy "users create own seen djs" on public.user_seen_djs for insert with check (auth.uid() = user_id);
create policy "users update own seen djs" on public.user_seen_djs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own seen djs" on public.user_seen_djs for delete using (auth.uid() = user_id);

drop policy if exists "users read own event statuses" on public.user_event_status;
drop policy if exists "users create own event statuses" on public.user_event_status;
drop policy if exists "users update own event statuses" on public.user_event_status;
drop policy if exists "users delete own event statuses" on public.user_event_status;
create policy "users read own event statuses" on public.user_event_status for select using (auth.uid() = user_id);
create policy "users create own event statuses" on public.user_event_status for insert with check (auth.uid() = user_id);
create policy "users update own event statuses" on public.user_event_status for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own event statuses" on public.user_event_status for delete using (auth.uid() = user_id);

drop policy if exists "badges are publicly readable" on public.badges;
drop policy if exists "admins manage badges" on public.badges;
create policy "badges are publicly readable" on public.badges for select using (true);
create policy "admins manage badges" on public.badges for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read own badges" on public.user_badges;
drop policy if exists "admins insert user badges" on public.user_badges;
create policy "users read own badges" on public.user_badges for select using (auth.uid() = user_id);
create policy "admins insert user badges" on public.user_badges for insert with check (public.is_admin());
-- Future backend workers can insert user_badges with the service role key. Never expose service role in frontend.

drop policy if exists "activity can be publicly read" on public.activity_events;
drop policy if exists "users insert own activity" on public.activity_events;
create policy "activity can be publicly read" on public.activity_events for select using (true);
create policy "users insert own activity" on public.activity_events for insert with check (auth.uid() = actor_id);
