-- Attendance is captured directly on the rating instead of a separate
-- pre-spin toggle -- each person self-reports, at the moment they log
-- their score, whether they watched it together in person or on their
-- own. Simpler than a shared "who's here" checklist and more accurate
-- since it's each person's own account rather than someone else tapping
-- names for them.
alter table public.ratings
  add column watched_with_group boolean not null default false;

create or replace function public.rate_pick(
  p_pick_id uuid,
  p_score numeric,
  p_review_text text,
  p_watched_with_group boolean default false
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_club_member() then
    raise exception 'Not a club member';
  end if;

  insert into public.ratings (pick_id, profile_id, score, review_text, watched_with_group)
  values (p_pick_id, auth.uid(), p_score, p_review_text, p_watched_with_group);

  update public.picks set status = 'watched'
    where id = p_pick_id and status = 'pending';
end;
$$;
