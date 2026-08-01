-- Merge any existing duplicate picks (same tmdb_id, created before the app
-- deduped on insert) into a single canonical row per movie, then enforce
-- uniqueness going forward so this can't recur.
do $$
declare
  dup record;
  keep_id uuid;
begin
  for dup in
    select tmdb_id from public.picks group by tmdb_id having count(*) > 1
  loop
    -- Prefer a watched duplicate as the survivor (it may already be linked
    -- to a session_result); otherwise keep the oldest.
    select id into keep_id
      from public.picks
      where tmdb_id = dup.tmdb_id
      order by (status = 'watched') desc, created_at asc
      limit 1;

    -- Re-point ratings that won't collide with a rating the survivor
    -- already has for the same person/session.
    update public.ratings r
      set pick_id = keep_id
      from public.picks p
      where r.pick_id = p.id
        and p.tmdb_id = dup.tmdb_id
        and p.id <> keep_id
        and not exists (
          select 1 from public.ratings r2
          where r2.pick_id = keep_id
            and r2.profile_id = r.profile_id
            and r2.session_id is not distinct from r.session_id
        );

    -- Drop whatever's left on the duplicates (would've violated uniqueness).
    delete from public.ratings r
      using public.picks p
      where r.pick_id = p.id
        and p.tmdb_id = dup.tmdb_id
        and p.id <> keep_id;

    update public.session_result sr
      set winning_pick_id = keep_id
      from public.picks p
      where sr.winning_pick_id = p.id
        and p.tmdb_id = dup.tmdb_id
        and p.id <> keep_id;

    if exists (
      select 1 from public.picks where tmdb_id = dup.tmdb_id and status = 'watched'
    ) then
      update public.picks set status = 'watched' where id = keep_id;
    end if;

    delete from public.picks
      where tmdb_id = dup.tmdb_id and id <> keep_id;
  end loop;
end $$;

alter table public.picks
  add constraint picks_tmdb_id_unique unique (tmdb_id);
