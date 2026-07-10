# Movie Club

Weekly movie club app: a communal board of movie picks (pulled from TMDB), a
synchronized "ready up + spin the wheel" pick-night flow, and post-watch
ratings/reviews with a home page ranking.

## Setup

### 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migration in `supabase/migrations/0001_init.sql`.
   It creates all tables, row-level security policies, and the
   `attempt_decide_winner` function that picks the wheel's winner atomically
   and pushes it to every connected client over Realtime.
3. In Authentication settings, make sure "Enable email signups" allows sign-in
   via magic link (default).
4. Grab your Project URL, anon key, and service role key from
   Project Settings → API.

### 2. Get a TMDB API key

Create a free account at [themoviedb.org](https://www.themoviedb.org/), then
generate an API key (v3 auth) under Settings → API.

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TMDB_API_KEY=
```

### 4. Sign in and invite the club

The first person to ever sign in (via the magic-link flow on `/login`)
automatically becomes the first club member — no manual database step
needed. After that, use the in-app **Settings** page to invite everyone
else — it sends them an email invite and adds them to the club automatically
once they accept.

### 5. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- **Picks** (`/picks`) — search TMDB and add movies to the shared pool.
- **Pick Night** (`/pick-night`) — everyone presses "I'm ready"; the instant
  the last person does, a Postgres function atomically picks a winner from
  the pending picks and every client's wheel animates to the same result via
  Supabase Realtime.
- **Rating** — after the spin, each member scores the film and writes a
  5+ word review.
- **Rankings** (`/`) — watched films ranked by average score; click through
  to see everyone's individual scores and reviews.
