"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { posterUrl, type TmdbSearchResult } from "@/lib/tmdb/client";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function LogMovieFlow() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<TmdbSearchResult | null>(null);
  const [score, setScore] = useState(7);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loggedPickId, setLoggedPickId] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setSearching(false);
  }

  function selectMovie(movie: TmdbSearchResult) {
    setSelected(movie);
    setScore(7);
    setReview("");
    setError(null);
    setLoggedPickId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const words = wordCount(review);
    if (words > 0 && words < 5) {
      setError("Either leave it blank or write at least 5 words.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    const { data: existingPick } = await supabase
      .from("picks")
      .select("id")
      .eq("tmdb_id", selected.id)
      .maybeSingle();

    let pickId = existingPick?.id as string | undefined;

    if (!pickId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You need to be signed in.");
        setSubmitting(false);
        return;
      }

      const { data: newPick, error: insertError } = await supabase
        .from("picks")
        .insert({
          tmdb_id: selected.id,
          title: selected.title,
          poster_path: selected.poster_path,
          release_year: selected.release_date
            ? Number(selected.release_date.slice(0, 4))
            : null,
          added_by: user.id,
        })
        .select("id")
        .single();

      if (insertError || !newPick) {
        setError(insertError?.message ?? "Could not log this movie.");
        setSubmitting(false);
        return;
      }
      pickId = newPick.id;
    }

    const { error: rpcError } = await supabase.rpc("rate_pick", {
      p_pick_id: pickId,
      p_score: score,
      p_review_text: review.trim() || null,
    });

    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setLoggedPickId(pickId!);
  }

  if (loggedPickId) {
    return (
      <div className="animate-scale-in flex flex-col items-center gap-4 rounded-lg border border-neutral-900 p-8 text-center">
        <p className="text-lg font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Logged!
        </p>
        <p className="text-sm text-neutral-400">
          {selected?.title} — {score.toFixed(1)}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/movie/${loggedPickId}`}
            className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98]"
          >
            View it
          </Link>
          <button
            onClick={() => {
              setSelected(null);
              setLoggedPickId(null);
              setResults([]);
              setQuery("");
            }}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition-all hover:bg-neutral-800 active:scale-[0.98]"
          >
            Log another
          </button>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="animate-fade-up flex flex-col gap-4">
        <button
          onClick={() => setSelected(null)}
          className="self-start text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Back to search
        </button>
        <div className="flex items-center gap-4 rounded-md border border-neutral-900 p-3">
          {posterUrl(selected.poster_path, "w200") ? (
            <Image
              src={posterUrl(selected.poster_path, "w200")!}
              alt={selected.title}
              width={48}
              height={72}
              className="rounded"
            />
          ) : (
            <div className="h-[72px] w-[48px] rounded bg-neutral-800" />
          )}
          <div>
            <p className="font-medium text-neutral-100">{selected.title}</p>
            <p className="text-xs text-neutral-500">
              {selected.release_date?.slice(0, 4)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-neutral-300">
              Score:{" "}
              <span className="font-semibold text-[var(--pink)]">
                {score.toFixed(1)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="accent-[var(--pink)] transition-transform active:scale-y-125"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-neutral-300">
              Your take (optional, 5+ words)
            </span>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-base text-neutral-100 placeholder:text-neutral-500 transition-colors focus:border-[var(--pink)] focus:outline-none"
              placeholder="What did you think? (optional)"
            />
          </label>
          {error && <p className="animate-fade-in text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Logging..." : "Log it"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie you watched..."
          className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-base text-neutral-100 placeholder:text-neutral-500 transition-colors focus:border-[var(--pink)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="animate-fade-up mt-4 flex flex-col gap-2 rounded-md border border-neutral-900 p-2">
          {results.slice(0, 8).map((movie) => (
            <button
              key={movie.id}
              onClick={() => selectMovie(movie)}
              className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-neutral-900"
            >
              {posterUrl(movie.poster_path, "w200") ? (
                <Image
                  src={posterUrl(movie.poster_path, "w200")!}
                  alt={movie.title}
                  width={32}
                  height={48}
                  className="rounded"
                />
              ) : (
                <div className="h-[48px] w-[32px] rounded bg-neutral-800" />
              )}
              <div className="flex-1">
                <p className="text-sm text-neutral-100">{movie.title}</p>
                <p className="text-xs text-neutral-500">
                  {movie.release_date?.slice(0, 4)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
