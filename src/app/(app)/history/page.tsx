import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { posterUrl } from "@/lib/tmdb/client";

interface Rating {
  score: number;
  review_text: string | null;
  watched_with_group: boolean;
  created_at: string;
  profiles: { display_name: string } | null;
}

interface WatchedPick {
  id: string;
  title: string;
  poster_path: string | null;
  release_year: number | null;
  ratings: Rating[];
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
    .from("picks")
    .select(
      `
      id, title, poster_path, release_year,
      ratings(score, review_text, watched_with_group, created_at, profiles(display_name))
    `
    )
    .eq("status", "watched")
    .returns<WatchedPick[]>();

  // A pick counts as "watched" the moment the wheel lands on it -- only
  // show it here once at least one person has actually rated it, same
  // rule Rankings uses, so nothing appears before anyone's weighed in.
  const watched = (data ?? [])
    .filter((p) => p.ratings.length > 0)
    .map((p) => ({
      ...p,
      // Earliest rating stands in for "when we watched it" -- there's no
      // separate watched-date field, and that's usually right after.
      watchedAt: p.ratings.reduce(
        (min, r) => (r.created_at < min ? r.created_at : min),
        p.ratings[0].created_at
      ),
    }))
    .sort((a, b) => (a.watchedAt < b.watchedAt ? 1 : -1));

  if (watched.length === 0) {
    return (
      <div className="animate-fade-up text-neutral-400">
        <h1 className="mb-2 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          History
        </h1>
        <p>
          No films watched yet. Add some{" "}
          <Link href="/picks" className="text-[var(--pink)] transition-colors hover:brightness-125">
            picks
          </Link>{" "}
          and{" "}
          <Link href="/spin-the-wheel" className="text-[var(--pink)] transition-colors hover:brightness-125">
            spin the wheel
          </Link>{" "}
          or{" "}
          <Link href="/log" className="text-[var(--pink)] transition-colors hover:brightness-125">
            log one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h1 className="mb-6 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
        History
      </h1>
      <div className="flex flex-col gap-4">
        {watched.map((pick, i) => {
          const avg =
            pick.ratings.reduce((sum, r) => sum + r.score, 0) / pick.ratings.length;
          const attendees = pick.ratings
            .filter((r) => r.watched_with_group)
            .map((r) => r.profiles?.display_name)
            .filter((n): n is string => !!n);
          const reviews = pick.ratings.filter((r) => r.review_text);

          return (
            <div
              key={pick.id}
              className={`animate-fade-up stagger-${Math.min(i + 1, 4)} rounded-md border border-neutral-900 p-4 transition-colors hover:border-neutral-700`}
            >
              <Link href={`/movie/${pick.id}`} className="group flex items-center gap-4">
                {posterUrl(pick.poster_path, "w200") ? (
                  <Image
                    src={posterUrl(pick.poster_path, "w200")!}
                    alt={pick.title}
                    width={40}
                    height={60}
                    className="shrink-0 rounded transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-[60px] w-[40px] shrink-0 rounded bg-neutral-800" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-100 transition-colors group-hover:text-[var(--pink)]">
                    {pick.title}
                    {pick.release_year && (
                      <span className="ml-2 text-neutral-500">({pick.release_year})</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(pick.watchedAt)}
                    {attendees.length > 0 && <> · watched together: {attendees.join(", ")}</>}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-[var(--font-display)] uppercase tracking-wide text-[var(--pink)]">
                  {avg.toFixed(1)}
                </span>
              </Link>

              {reviews.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 border-t border-neutral-900 pt-3">
                  {reviews.map((r, j) => (
                    <div key={j} className="text-sm">
                      <span className="font-medium text-neutral-200">
                        {r.profiles?.display_name ?? "member"}
                      </span>
                      <span className="ml-2 text-neutral-500">{r.score.toFixed(1)}</span>
                      <p className="text-neutral-400">{r.review_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
