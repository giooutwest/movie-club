import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { posterUrl } from "@/lib/tmdb/client";

interface Pick {
  id: string;
  title: string;
  poster_path: string | null;
  release_year: number | null;
}

interface SessionRow {
  id: string;
  created_at: string;
  session_result: { winning_pick_id: string; picks: Pick | null } | null;
  ratings: {
    score: number;
    pick_id: string;
    watched_with_group: boolean;
    profiles: { display_name: string } | null;
  }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("sessions")
    .select(
      `
      id,
      created_at,
      session_result(winning_pick_id, picks(id, title, poster_path, release_year)),
      ratings(score, pick_id, watched_with_group, profiles(display_name))
    `
    )
    .order("created_at", { ascending: false })
    .returns<SessionRow[]>();

  // Only nights that actually happened -- a session someone abandoned or
  // re-spun before anyone rated the current pick isn't a real movie night.
  // (Ratings are scoped to the winning pick, not just the session, so a
  // stale rating from before a "spin again" doesn't count here.)
  const nights = (data ?? [])
    .filter((s) => s.session_result?.picks)
    .map((s) => ({
      ...s,
      ratings: s.ratings.filter((r) => r.pick_id === s.session_result!.winning_pick_id),
    }))
    .filter((s) => s.ratings.length > 0);

  if (nights.length === 0) {
    return (
      <div className="animate-fade-up text-neutral-400">
        <h1 className="mb-2 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          History
        </h1>
        <p>
          No movie nights logged yet. Run a{" "}
          <Link href="/spin-the-wheel" className="text-[var(--pink)] transition-colors hover:brightness-125">
            spin the wheel
          </Link>{" "}
          and rate the pick to start one.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h1 className="mb-6 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
        History
      </h1>
      <ol className="flex flex-col gap-3">
        {nights.map((night, i) => {
          const pick = night.session_result!.picks!;
          const scores = night.ratings.map((r) => r.score);
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          const attendees = night.ratings
            .filter((r) => r.watched_with_group)
            .map((r) => r.profiles?.display_name)
            .filter((n): n is string => !!n);

          return (
            <li
              key={night.id}
              className={`animate-fade-up stagger-${Math.min(i + 1, 4)}`}
            >
              <Link
                href={`/movie/${pick.id}`}
                className="group flex items-center gap-4 rounded-md border border-neutral-900 p-3 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950"
              >
                {posterUrl(pick.poster_path, "w200") ? (
                  <Image
                    src={posterUrl(pick.poster_path, "w200")!}
                    alt={pick.title}
                    width={40}
                    height={60}
                    className="rounded transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-[60px] w-[40px] rounded bg-neutral-800" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-100 transition-colors group-hover:text-[var(--pink)]">
                    {pick.title}
                    {pick.release_year && (
                      <span className="ml-2 text-neutral-500">({pick.release_year})</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(night.created_at)}
                    {attendees.length > 0 && <> · {attendees.join(", ")}</>}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-[var(--font-display)] uppercase tracking-wide text-[var(--pink)]">
                  {avg.toFixed(1)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
