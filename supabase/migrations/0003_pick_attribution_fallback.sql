-- Allow picks to be attributed to a plain name when no matching profile
-- exists yet (e.g. bulk-imported recs from before the person signed up).
alter table public.picks
  alter column added_by drop not null,
  add column added_by_name text;

alter table public.picks
  add constraint picks_added_by_or_name_check
  check (added_by is not null or added_by_name is not null);
