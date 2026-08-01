-- One-off: merge the "Abe the Ape" duplicate account into "Abraham".
-- Run manually in Supabase Studio's SQL editor. NOT a tracked migration.
--
-- Step 1 - run this first to see the exact stored spelling/casing of both
-- names (the first attempt failed on an exact '=' match against 'Abraham',
-- so whatever's in the DB differs in case, whitespace, or wording):
--
--   select id, display_name from public.profiles
--   where display_name ilike '%abraham%' or display_name ilike '%abe%ape%';
--
-- Step 2 - if the printed display_name values aren't exactly "Abraham" and
-- "Abe the Ape", edit the two `ilike` patterns below to match what you saw,
-- then run the block. It re-points picks/ratings/session_members from the
-- duplicate to the survivor (dropping anything that would collide with a
-- row the survivor already has), removes the duplicate's club membership,
-- and deletes their auth user (which cascades to profiles via the
-- on-delete-cascade FK).

do $$
declare
  survivor_id uuid;
  duplicate_id uuid;
begin
  select id into survivor_id from public.profiles where display_name ilike 'abraham';
  select id into duplicate_id from public.profiles where display_name ilike 'abe the ape';

  if survivor_id is null or duplicate_id is null then
    raise exception 'Could not find both profiles by name (survivor=%, duplicate=%)', survivor_id, duplicate_id;
  end if;

  update public.picks
    set added_by = survivor_id
    where added_by = duplicate_id;

  update public.ratings r
    set profile_id = survivor_id
    where r.profile_id = duplicate_id
      and not exists (
        select 1 from public.ratings r2
        where r2.pick_id = r.pick_id
          and r2.profile_id = survivor_id
          and r2.session_id is not distinct from r.session_id
      );
  delete from public.ratings where profile_id = duplicate_id;

  update public.session_members sm
    set profile_id = survivor_id
    where sm.profile_id = duplicate_id
      and not exists (
        select 1 from public.session_members sm2
        where sm2.session_id = sm.session_id and sm2.profile_id = survivor_id
      );
  delete from public.session_members where profile_id = duplicate_id;

  delete from public.club_members where profile_id = duplicate_id;

  delete from auth.users where id = duplicate_id;
end $$;
