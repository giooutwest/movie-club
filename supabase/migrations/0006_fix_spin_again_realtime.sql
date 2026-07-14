-- spin_again previously deleted then re-inserted the session_result row
-- (same session_id primary key). Supabase Realtime does not reliably
-- deliver the INSERT event to subscribers in that case, so clients never
-- saw the re-spin. Update the existing row in place instead -- clients
-- listen for UPDATE events on session_result to pick this up.
create or replace function public.spin_again(p_session_id uuid)
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

  select id into v_new_pick_id
    from public.picks
    where status = 'pending'
    order by random()
    limit 1;

  if v_new_pick_id is null then
    raise exception 'No pending picks available to spin';
  end if;

  update public.session_result
    set winning_pick_id = v_new_pick_id, seed = random(), decided_at = now()
    where session_id = p_session_id;

  update public.picks set status = 'watched' where id = v_new_pick_id;
end;
$$;
