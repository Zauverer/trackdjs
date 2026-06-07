-- TrackDJs profile save fix
-- Safe to run more than once in Supabase SQL Editor.

alter table public.profiles
  add column if not exists email text,
  add column if not exists username text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists city text,
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists spotify_url text,
  add column if not exists spotify_playlist_url text,
  add column if not exists website_url text,
  add column if not exists public_contact_enabled boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Keep old display_name installs compatible while the app now writes full_name.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'display_name'
  ) then
    execute 'update public.profiles set full_name = coalesce(full_name, display_name) where full_name is null';
  end if;
end $$;

create index if not exists profiles_username_lookup_idx
  on public.profiles (lower(username))
  where username is not null and username <> '';
