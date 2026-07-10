import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMovieDetails, posterUrl } from "@/lib/tmdb/client";

interface RatingRow {
  score: number;
  review_text: string;
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

  const { data: ratings } = await supabase
    .from("ratings")
    .select("score, review_text, profiles(display_name)")
    .eq("pick_id", pickId)
    .returns<RatingRow[]>();

  const details = await getMovieDetails(pick.tmdb_id).catch(() => null);

  const avg =
    ratings && ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;

  return (
    <div>
      <div className="flex gap-6">
        {posterUrl(pick.poster_path, "w500") ? (
          <Image
            src={posterUrl(pick.poster_path, "w500")!}
            alt={pick.title}
            width={200}
            height={300}
            className="rounded-md"
          />
        ) : (
          <div className="h-[300px] w-[200px] rounded-md bg-neutral-800" />
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
            {pick.title}{" "}
            {pick.release_year && (
              <span className="text-neutral-500">({pick.release_year})</span>
            )}
          </h1>
          {avg !== null && (
            <p className="text-lg font-medium text-neutral-100">
              {avg.toFixed(1)} average · {ratings!.length} rating
              {ratings!.length === 1 ? "" : "s"}
            </p>
          )}
          {details && (
            <>
              <p className="max-w-xl text-sm text-neutral-400">
                {details.overview}
              </p>
              {details.credits?.cast?.length > 0 && (
                <p className="text-sm text-neutral-500">
                  Cast:{" "}
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

      <h2 className="mb-3 mt-10 text-lg font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
        Everyone&apos;s scores
      </h2>
      <div className="flex flex-col gap-3">
        {(ratings ?? []).map((r, i) => (
          <div
            key={i}
            className="rounded-md border border-neutral-900 p-4"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-100">
                {r.profiles?.display_name ?? "member"}
              </span>
              <span className="text-sm font-semibold text-neutral-100">
                {r.score.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-neutral-400">{r.review_text}</p>
          </div>
        ))}
        {(ratings ?? []).length === 0 && (
          <p className="text-neutral-500">No ratings yet.</p>
        )}
      </div>
    </div>
  );
}
