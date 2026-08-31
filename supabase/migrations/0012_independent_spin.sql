-- Spinning no longer requires everyone in the club to "ready up" first --
-- any club member can spin independently, whenever they want. Drop the
-- not-ready gate from attempt_decide_winner; the status='gathering' lock
-- still prevents two concurrent spins from both deciding a winner.
create or replace function public.attempt_decide_winner(p_session_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_status text;
  v_pick_id uuid;
begin
  -- Lock the session row so concurrent triggers can't both decide a winner.
  select status into v_status from public.sessions where id = p_session_id for update;

  if v_status is distinct from 'gathering' then
    return; -- already decided (or not in a decidable state)
  end if;

  select id into v_pick_id
    from public.picks
    where status = 'pending'
    order by random()
    limit 1;

  if v_pick_id is null then
    raise exception 'No pending picks available to spin';
  end if;

  insert into public.session_result (session_id, winning_pick_id, seed)
    values (p_session_id, v_pick_id, random());

  update public.picks set status = 'watched' where id = v_pick_id;
  update public.sessions set status = 'result' where id = p_session_id;
end;
$$;
