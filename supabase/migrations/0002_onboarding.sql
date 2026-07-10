-- Tracks whether a member has finished the name-entry / add-to-home-screen
-- welcome flow after their very first magic-link sign-in.
alter table public.profiles
  add column onboarded boolean not null default false;
