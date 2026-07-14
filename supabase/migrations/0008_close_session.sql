-- The `sessions` table has no RLS update policy, so the app's previous
-- direct `.update({status:'closed'})` call silently affected zero rows --
-- sessions never actually closed, so every visit to Spin the Wheel kept
-- resuming the same never-closed session and its already-decided winner.
-- Close (and abandon) sessions through a security-definer function instead,
-- mirroring attempt_decide_winner/spin_again.
create function public.close_session(p_session_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_winning_pick_id uuid;
  v_rating_count int;
begin
  if not public.is_club_member() then
    raise exception 'Not a club member';
  end if;

  select winning_pick_id into v_winning_pick_id
    from public.session_result
    where session_id = p_session_id;

  if v_winning_pick_id is not null then
    select count(*) into v_rating_count
      from public.ratings
      where session_id = p_session_id and pick_id = v_winning_pick_id;

    -- Nobody actually rated the winner (e.g. the session was abandoned) --
    -- put it back in the pool instead of permanently burning the pick.
    if v_rating_count = 0 then
      update public.picks set status = 'pending' where id = v_winning_pick_id;
    end if;
  end if;

  update public.sessions set status = 'closed' where id = p_session_id;
end;
$$;
