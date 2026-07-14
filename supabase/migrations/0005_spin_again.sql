-- Lets any club member re-spin after a winner has already been decided:
-- reverts the previous winner back to pending, clears the old result, and
-- picks a fresh one. Mirrors attempt_decide_winner's selection logic.
create function public.spin_again(p_session_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_previous_pick_id uuid;
  v_new_pick_id uuid;
begin
  if not public.is_club_member() then
    raise exception 'Not a club member';
  end if;

  select winning_pick_id into v_previous_pick_id
    from public.session_result
    where session_id = p_session_id
    for update;

  if v_previous_pick_id is null then
    raise exception 'No result to re-spin';
  end if;

  update public.picks set status = 'pending' where id = v_previous_pick_id;
  delete from public.session_result where session_id = p_session_id;

  select id into v_new_pick_id
    from public.picks
    where status = 'pending'
    order by random()
    limit 1;

  if v_new_pick_id is null then
    raise exception 'No pending picks available to spin';
  end if;

  insert into public.session_result (session_id, winning_pick_id, seed)
    values (p_session_id, v_new_pick_id, random());

  update public.picks set status = 'watched' where id = v_new_pick_id;
end;
$$;
