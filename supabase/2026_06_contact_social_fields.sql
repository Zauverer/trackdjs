-- TrackDJs Sprint 6B
-- Safe migration: contact and social profile fields.
-- Run manually in Supabase SQL Editor after schema.sql/rls.sql/seed.sql.

alter table public.profiles
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists spotify_url text,
  add column if not exists spotify_playlist_url text,
  add column if not exists website_url text,
  add column if not exists public_contact_enabled boolean default false;

alter table public.djs
  add column if not exists tiktok_url text,
  add column if not exists contact_email text,
  add column if not exists contact_enabled boolean default false;

alter table public.producers
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists tiktok_url text,
  add column if not exists comuna text;

alter table public.venues
  add column if not exists comuna text,
  add column if not exists website_url text,
  add column if not exists tiktok_url text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

comment on column public.profiles.public_contact_enabled is 'Whether this user wants public profile contact/social CTAs visible.';
comment on column public.djs.contact_enabled is 'Whether TrackDJs should show contact CTA for this DJ profile.';
