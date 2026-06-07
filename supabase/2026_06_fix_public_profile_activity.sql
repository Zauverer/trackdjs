-- TrackDJs HOTFIX 7A.2
-- Public, limited activity views for /u/[username].
-- Does not expose emails or private profile fields.

create or replace view public.public_profile_seen_djs as
select
  p.username,
  d.slug as dj_slug,
  d.artist_name,
  d.country,
  d.city,
  usd.seen_at,
  usd.created_at
from public.profiles p
join public.user_seen_djs usd on usd.user_id = p.id
join public.djs d on d.id = usd.dj_id
where p.username is not null;

create or replace view public.public_profile_event_status as
select
  p.username,
  e.slug as event_slug,
  e.name as event_name,
  e.city,
  e.starts_at,
  ues.status,
  ues.created_at
from public.profiles p
join public.user_event_status ues on ues.user_id = p.id
join public.events e on e.id = ues.event_id
where p.username is not null;

grant select on public.public_profile_seen_djs to anon, authenticated;
grant select on public.public_profile_event_status to anon, authenticated;
