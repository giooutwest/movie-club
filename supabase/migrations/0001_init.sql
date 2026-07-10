-- Movie Club schema: profiles, club membership, picks, spin sessions, ratings.

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up. The very
-- first person to ever sign in becomes an active club member automatically
-- (so the club's creator doesn't need to run any SQL by hand); everyone
-- after that is added via the in-app Settings invite flow.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  if not exists (select 1 from public.club_members) then
    insert into public.club_members (profile_id, active) values (new.id, true);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- club membership (invite-only gate) ----------
create table public.club_members (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create function public.is_club_member()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.club_members
    where profile_id = auth.uid() and active
  );
$$;

-- ---------- picks (communal recommendations pulled from TMDB) ----------
create table public.picks (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  release_year integer,
  added_by uuid not null references public.profiles (id),
  status text not null default 'pending' check (status in ('pending', 'watched')),
  created_at timestamptz not null default now()
);

-- ---------- spin sessions ----------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'gathering'
    check (status in ('gathering', 'spinning', 'result', 'rating_open', 'closed')),
  created_at timestamptz not null default now()
);

create table public.session_members (
  session_id uuid not null references public.sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id),
  ready boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (session_id, profile_id)
);

create table public.session_result (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  winning_pick_id uuid not null references public.picks (id),
  seed double precision not null,
  decided_at timestamptz not null default now()
);

-- ---------- ratings ----------
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  pick_id uuid not null references public.picks (id),
  profile_id uuid not null references public.profiles (id),
  score numeric(3, 1) not null check (score >= 0 and score <= 10),
  review_text text not null,
  created_at timestamptz not null default now(),
  unique (session_id, profile_id),
  constraint review_min_five_words check (
    array_length(regexp_split_to_array(trim(review_text), '\s+'), 1) >= 5
  )
);

-- ---------- atomic winner selection ----------
-- Runs server-side so every connected client, regardless of who presses
-- "ready" last, observes the exact same outcome via the session_result row.
create function public.attempt_decide_winner(p_session_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_status text;
  v_total int;
  v_not_ready int;
  v_pick_id uuid;
begin
  -- Lock the session row so concurrent triggers can't both decide a winner.
  select status into v_status from public.sessions where id = p_session_id for update;

  if v_status is distinct from 'gathering' then
    return; -- already decided (or not in a decidable state)
  end if;

  select count(*), count(*) filter (where not ready)
    into v_total, v_not_ready
    from public.session_members
    where session_id = p_session_id;

  if v_total = 0 or v_not_ready > 0 then
    return; -- not everyone is ready yet
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

create function public.on_session_member_ready()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.ready then
    perform public.attempt_decide_winner(new.session_id);
  end if;
  return new;
end;
$$;

create trigger trg_session_member_ready
  after insert or update of ready on public.session_members
  for each row execute function public.on_session_member_ready();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.club_members enable row level security;
alter table public.picks enable row level security;
alter table public.sessions enable row level security;
alter table public.session_members enable row level security;
alter table public.session_result enable row level security;
alter table public.ratings enable row level security;

create policy "club members can read profiles" on public.profiles
  for select using (public.is_club_member());
create policy "users can update own profile" on public.profiles
  for update using (id = auth.uid());

create policy "club members can read membership" on public.club_members
  for select using (public.is_club_member());

create policy "club members can read picks" on public.picks
  for select using (public.is_club_member());
create policy "club members can add picks" on public.picks
  for insert with check (public.is_club_member() and added_by = auth.uid());

create policy "club members can read sessions" on public.sessions
  for select using (public.is_club_member());
create policy "club members can create sessions" on public.sessions
  for insert with check (public.is_club_member());

create policy "club members can read session members" on public.session_members
  for select using (public.is_club_member());
create policy "club members can join a session" on public.session_members
  for insert with check (public.is_club_member() and profile_id = auth.uid());
create policy "members can update own ready state" on public.session_members
  for update using (public.is_club_member() and profile_id = auth.uid());

create policy "club members can read session results" on public.session_result
  for select using (public.is_club_member());

create policy "club members can read ratings" on public.ratings
  for select using (public.is_club_member());
create policy "members can submit own rating" on public.ratings
  for insert with check (public.is_club_member() and profile_id = auth.uid());

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.session_members;
alter publication supabase_realtime add table public.session_result;
alter publication supabase_realtime add table public.sessions;

