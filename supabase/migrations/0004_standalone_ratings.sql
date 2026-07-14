-- Ratings no longer require a pick-night session: members can rate any
-- pick directly from the Picks page (e.g. movies they'd already seen, or
-- outside the formal wheel-spin flow). Review text becomes optional --
-- a score alone is enough -- but if given, it still needs 5+ words.
alter table public.ratings
  alter column session_id drop not null,
  alter column review_text drop not null;

alter table public.ratings
  drop constraint review_min_five_words;
alter table public.ratings
  add constraint review_min_five_words check (
    review_text is null
    or array_length(regexp_split_to_array(trim(review_text), '\s+'), 1) >= 5
  );

-- One ad-hoc (non-session) rating per person per pick.
create unique index ratings_person_pick_no_session
  on public.ratings (pick_id, profile_id)
  where session_id is null;

-- Lets a club member rate a pick directly, outside of any pick-night
-- session, and marks the pick watched so it shows up on Rankings --
-- mirrors what attempt_decide_winner does for the wheel-spin flow.
create function public.rate_pick(p_pick_id uuid, p_score numeric, p_review_text text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_club_member() then
    raise exception 'Not a club member';
  end if;

  insert into public.ratings (pick_id, profile_id, score, review_text)
  values (p_pick_id, auth.uid(), p_score, p_review_text);

  update public.picks set status = 'watched'
    where id = p_pick_id and status = 'pending';
end;
$$;
