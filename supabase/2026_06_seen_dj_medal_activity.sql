-- TrackDJs Sprint 7B
-- Public, limited activity views for seen-DJ medals and attended events.
-- Safe migration: does not delete data and does not expose emails.

create or replace view public.public_profile_seen_djs as
select
  p.username,
  d.slug as dj_slug,
  d.artist_name,
  d.country,
  coalesce(nullif(upper(d.country), ''), 'CL') as country_code_raw,
  case
    when lower(coalesce(d.country, '')) in ('chile', 'cl') then 'CL'
    when lower(coalesce(d.country, '')) in ('belgium', 'be') then 'BE'
    when lower(coalesce(d.country, '')) in ('argentina', 'ar') then 'AR'
    when lower(coalesce(d.country, '')) in ('germany', 'de') then 'DE'
    when lower(coalesce(d.country, '')) in ('brazil', 'br') then 'BR'
    when lower(coalesce(d.country, '')) in ('united states', 'usa', 'us') then 'US'
    when lower(coalesce(d.country, '')) in ('united kingdom', 'uk', 'gb') then 'GB'
    else 'CL'
  end as country_code,
  d.city,
  e.slug as event_slug,
  e.name as event_name,
  extract(year from coalesce(e.starts_at, usd.seen_at, usd.created_at))::int as seen_year,
  coalesce(usd.verification_status, 'self_reported') as verification_status,
  usd.seen_at,
  usd.created_at
from public.profiles p
join public.user_seen_djs usd on usd.user_id = p.id
join public.djs d on d.id = usd.dj_id
left join public.events e on e.id = usd.event_id
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
