create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  full_name text,
  display_name text,
  avatar_url text,
  city text,
  bio text,
  favorite_genres text[] default '{}',
  instagram_url text,
  tiktok_url text,
  spotify_url text,
  spotify_playlist_url text,
  website_url text,
  public_contact_enabled boolean not null default false,
  role text not null default 'fan' check (role in ('fan', 'dj', 'producer', 'venue', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.djs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  artist_name text not null,
  real_name text,
  country text,
  city text,
  bio text,
  photo_url text,
  genres text[] default '{}',
  instagram_url text,
  tiktok_url text,
  soundcloud_url text,
  spotify_url text,
  youtube_url text,
  website_url text,
  contact_email text,
  contact_enabled boolean not null default false,
  verified boolean not null default false,
  claimed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  city text,
  comuna text,
  address text,
  lat numeric,
  lng numeric,
  map_url text,
  instagram_url text,
  tiktok_url text,
  website_url text,
  contact_email text,
  contact_phone text,
  capacity integer,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.producers (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  city text,
  comuna text,
  instagram_url text,
  tiktok_url text,
  website_url text,
  contact_email text,
  contact_phone text,
  description text,
  verified boolean not null default false,
  claimed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  city text,
  venue_id uuid references public.venues(id),
  producer_id uuid references public.producers(id),
  address text,
  lat numeric,
  lng numeric,
  ticket_url text,
  event_type text,
  genres text[] default '{}',
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'finished', 'cancelled')),
  cover_image_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_lineup (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  dj_id uuid not null references public.djs(id) on delete cascade,
  stage_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  is_headliner boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_dj_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  dj_id uuid not null references public.djs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dj_id)
);

create table if not exists public.user_seen_djs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  dj_id uuid not null references public.djs(id) on delete cascade,
  event_id uuid references public.events(id),
  seen_at timestamptz,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, dj_id, event_id)
);

create unique index if not exists idx_user_seen_djs_unique_without_event
on public.user_seen_djs(user_id, dj_id)
where event_id is null;

create table if not exists public.user_event_status (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status text not null check (status in ('interested', 'going', 'attended', 'saved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  description text,
  icon text,
  condition_type text,
  condition_value integer,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  source_id uuid,
  primary key (user_id, badge_id)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_djs_slug on public.djs(slug);
create index if not exists idx_djs_genres on public.djs using gin(genres);
create index if not exists idx_events_slug on public.events(slug);
create index if not exists idx_events_starts_at on public.events(starts_at);
create index if not exists idx_events_city on public.events(city);
create index if not exists idx_events_genres on public.events using gin(genres);
create index if not exists idx_event_lineup_event_id on public.event_lineup(event_id);
create index if not exists idx_event_lineup_dj_id on public.event_lineup(dj_id);
create index if not exists idx_user_seen_djs_user_id on public.user_seen_djs(user_id);
create index if not exists idx_user_dj_follows_user_id on public.user_dj_follows(user_id);
create index if not exists idx_user_event_status_user_id on public.user_event_status(user_id);
create index if not exists idx_activity_events_actor_id on public.activity_events(actor_id);
create index if not exists idx_activity_events_created_at on public.activity_events(created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists set_djs_updated_at on public.djs;
create trigger set_djs_updated_at before update on public.djs for each row execute function public.set_updated_at();

drop trigger if exists set_venues_updated_at on public.venues;
create trigger set_venues_updated_at before update on public.venues for each row execute function public.set_updated_at();

drop trigger if exists set_producers_updated_at on public.producers;
create trigger set_producers_updated_at before update on public.producers for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at before update on public.events for each row execute function public.set_updated_at();

drop trigger if exists set_user_event_status_updated_at on public.user_event_status;
create trigger set_user_event_status_updated_at before update on public.user_event_status for each row execute function public.set_updated_at();
