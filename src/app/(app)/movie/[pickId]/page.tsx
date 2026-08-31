import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRuntime, getMovieDetails, posterUrl } from "@/lib/tmdb/client";
import { RateForm } from "./rate-form";

interface RatingRow {
  score: number;
  review_text: string | null;
  profile_id: string;
  profiles: { display_name: string } | null;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ pickId: string }>;
}) {
  const { pickId } = await params;
  const supabase = await createClient();

  const { data: pick } = await supabase
    .from("picks")
    .select("id, tmdb_id, title, poster_path, release_year")
    .eq("id", pickId)
    .single();

  if (!pick) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ratings } = await supabase
    .from("ratings")
    .select("score, review_text, profile_id, profiles(display_name)")
    .eq("pick_id", pickId)
    .returns<RatingRow[]>();

  const hasRated = !!ratings?.some((r) => r.profile_id === user?.id);

  const details = await getMovieDetails(pick.tmdb_id).catch(() => null);

  const avg =
    ratings && ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;

  return (
    <div className="animate-fade-up pb-16">
      <Link
        href="/picks"
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-[var(--pink)]"
      >
        ← Back to picks
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        {posterUrl(pick.poster_path, "w500") ? (
          <Image
            src={posterUrl(pick.poster_path, "w500")!}
            alt={pick.title}
            width={200}
            height={300}
            className="w-40 shrink-0 self-center rounded-md shadow-[0_12px_30px_rgba(0,0,0,0.6)] sm:w-[200px] sm:self-start"
            priority
          />
        ) : (
          <div className="h-[240px] w-40 shrink-0 self-center rounded-md bg-neutral-900 sm:h-[300px] sm:w-[200px] sm:self-start" />
        )}
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <div>
            <h1 className="text-2xl font-[var(--font-display)] uppercase leading-tight tracking-wide text-neutral-100 sm:text-3xl">
              {pick.title}
            </h1>
            {(details?.genres?.length || pick.release_year || details?.runtime) && (
              <p className="mt-1 text-sm uppercase tracking-wide text-neutral-500">
                {details?.genres?.map((g) => g.name).join(", ")}
                {details?.genres?.length && pick.release_year ? " · " : ""}
                {pick.release_year}
                {formatRuntime(details?.runtime) && (pick.release_year || details?.genres?.length) ? " · " : ""}
                {formatRuntime(details?.runtime)}
              </p>
            )}
          </div>
          {avg !== null && (
            <p className="text-lg font-semibold text-[var(--pink)]">
              {avg.toFixed(1)} average
              <span className="ml-2 text-sm font-normal text-neutral-500">
                {ratings!.length} rating{ratings!.length === 1 ? "" : "s"}
              </span>
            </p>
          )}
          {details && (
            <>
              <p className="max-w-xl text-justify text-sm leading-relaxed text-neutral-400">
                {details.overview}
              </p>
              {details.credits?.cast?.length > 0 && (
                <p className="text-sm leading-relaxed text-neutral-500">
                  <span className="text-neutral-400">Cast: </span>
                  {details.credits.cast
                    .slice(0, 6)
                    .map((c) => c.name)
                    .join(", ")}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {!hasRated && user && (
        <div className="animate-fade-up stagger-1 mt-10 rounded-lg border border-neutral-900 bg-neutral-950/60 p-5">
          <h2 className="mb-4 text-lg font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
            Rate it
          </h2>
          <RateForm pickId={pick.id} />
        </div>
      )}

      <h2 className="mb-3 mt-10 text-lg font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
        Everyone&apos;s scores
      </h2>
      <div className="flex flex-col gap-3">
        {(ratings ?? []).map((r, i) => (
          <div
            key={i}
            className={`animate-fade-up rounded-md border border-neutral-900 p-4 transition-colors hover:border-neutral-700 stagger-${Math.min(i + 1, 4)}`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-100">
                {r.profiles?.display_name ?? "member"}
              </span>
              <span className="text-sm font-semibold text-[var(--pink)]">
                {r.score.toFixed(1)}
              </span>
            </div>
            {r.review_text && (
              <p className="text-sm leading-relaxed text-neutral-400">
                {r.review_text}
              </p>
            )}
          </div>
        ))}
        {(ratings ?? []).length === 0 && (
          <p className="text-neutral-500">No ratings yet.</p>
        )}
      </div>
    </div>
  );
}
