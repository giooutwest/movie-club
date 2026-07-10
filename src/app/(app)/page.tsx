import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { posterUrl } from "@/lib/tmdb/client";

interface WatchedPick {
  id: string;
  title: string;
  poster_path: string | null;
  release_year: number | null;
  ratings: { score: number }[];
}

export default async function RankingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("picks")
    .select("id, title, poster_path, release_year, ratings(score)")
    .eq("status", "watched")
    .returns<WatchedPick[]>();

  const ranked = (data ?? [])
    .map((pick) => {
      const scores = pick.ratings.map((r) => r.score);
      const avg = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;
      return { ...pick, avg, count: scores.length };
    })
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

  if (ranked.length === 0) {
    return (
      <div className="text-neutral-400">
        <h1 className="mb-2 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Rankings
        </h1>
        <p>
          No films watched yet. Add some{" "}
          <Link href="/picks" className="underline">
            picks
          </Link>{" "}
          and run a{" "}
          <Link href="/pick-night" className="underline">
            pick night
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
        Rankings
      </h1>
      <ol className="flex flex-col gap-2">
        {ranked.map((pick, i) => (
          <li key={pick.id}>
            <Link
              href={`/movie/${pick.id}`}
              className="flex items-center gap-4 rounded-md border border-neutral-900 p-3 transition hover:border-neutral-700"
            >
              <span className="w-6 text-right text-sm font-medium text-neutral-500">
                {i + 1}
              </span>
              {posterUrl(pick.poster_path, "w200") ? (
                <Image
                  src={posterUrl(pick.poster_path, "w200")!}
                  alt={pick.title}
                  width={40}
                  height={60}
                  className="rounded"
                />
              ) : (
                <div className="h-[60px] w-[40px] rounded bg-neutral-800" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-100">
                  {pick.title}
                  {pick.release_year && (
                    <span className="ml-2 text-neutral-500">
                      ({pick.release_year})
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {pick.count} rating{pick.count === 1 ? "" : "s"}
                </p>
              </div>
              <span className="text-lg font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
                {pick.avg?.toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
