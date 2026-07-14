-- Spinning the wheel is now a deliberate action: once everyone is ready,
-- a "Start" button appears and any member can trigger it, rather than the
-- wheel spinning automatically the instant the last person readies up.
drop trigger if exists trg_session_member_ready on public.session_members;
