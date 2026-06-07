-- Sprint 7A Auth profile compatibility.
-- Safe migration: adds email storage for profiles created from Supabase Auth.

alter table public.profiles
  add column if not exists email text;

create index if not exists idx_profiles_email on public.profiles(email);

comment on column public.profiles.email is 'Email copied from Supabase Auth for the authenticated user profile.';

-- Existing RLS policies in supabase/rls.sql already cover:
-- - public profile reads
-- - users inserting their own profile
-- - users updating only their own profile
