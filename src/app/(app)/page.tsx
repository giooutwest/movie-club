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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let logNowBanner: { title: string } | null = null;
  if (user) {
    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .neq("status", "closed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (session) {
      const { data: result } = await supabase
        .from("session_result")
        .select("winning_pick_id")
        .eq("session_id", session.id)
        .maybeSingle();

      if (result) {
        const { data: myRating } = await supabase
          .from("ratings")
          .select("id")
          .eq("session_id", session.id)
          .eq("profile_id", user.id)
          .maybeSingle();

        if (!myRating) {
          const { data: pick } = await supabase
            .from("picks")
            .select("title")
            .eq("id", result.winning_pick_id)
            .single();
          if (pick) logNowBanner = { title: pick.title };
        }
      }
    }
  }

  const ranked = (data ?? [])
    .map((pick) => {
      const scores = pick.ratings.map((r) => r.score);
      const avg = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;
      return { ...pick, avg, count: scores.length };
    })
    // A pick is marked "watched" the moment the wheel lands on it (or the
    // instant someone rates it directly) -- only show it here once at least
    // one person has actually rated it, so it doesn't appear "randomly"
    // before anyone's weighed in.
    .filter((pick) => pick.count > 0)
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

  const banner = logNowBanner && (
    <Link
      href="/spin-the-wheel"
      className="animate-fade-up mb-6 flex items-center justify-between rounded-md border border-[var(--pink)] bg-neutral-950 px-4 py-3 text-sm transition-colors hover:bg-neutral-900"
    >
      <span className="text-neutral-200">
        <span className="font-medium text-neutral-100">
          {logNowBanner.title}
        </span>{" "}
        was picked
      </span>
      <span className="font-bold uppercase tracking-wide text-[var(--pink)]">
        Log now
      </span>
    </Link>
  );

  if (ranked.length === 0) {
    return (
      <div className="animate-fade-up text-neutral-400">
        {banner}
        <h1 className="mb-2 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Rankings
        </h1>
        <p>
          No films watched yet. Add some{" "}
          <Link href="/picks" className="text-[var(--pink)] transition-colors hover:brightness-125">
            picks
          </Link>{" "}
          and run a{" "}
          <Link href="/spin-the-wheel" className="text-[var(--pink)] transition-colors hover:brightness-125">
            spin the wheel
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {banner}
      <h1 className="mb-6 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
        Rankings
      </h1>
      <ol className="flex flex-col gap-2">
        {ranked.map((pick, i) => (
          <li
            key={pick.id}
            className={`animate-fade-up stagger-${Math.min(i + 1, 4)}`}
          >
            <Link
              href={`/movie/${pick.id}`}
              className="group flex items-center gap-4 rounded-md border border-neutral-900 p-3 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-950"
            >
              <span
                className={`w-6 text-right text-sm font-medium ${
                  i === 0 ? "text-[var(--pink)]" : "text-neutral-500"
                }`}
              >
                {i + 1}
              </span>
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
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-100 transition-colors group-hover:text-[var(--pink)]">
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
              <span className="text-lg font-[var(--font-display)] uppercase tracking-wide text-[var(--pink)]">
                {pick.avg?.toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
