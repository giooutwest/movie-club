"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { posterUrl, type TmdbSearchResult } from "@/lib/tmdb/client";

export function AddPickForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setSearching(false);
  }

  async function addPick(movie: TmdbSearchResult) {
    setAddingId(movie.id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("picks").insert({
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_year: movie.release_date
        ? Number(movie.release_date.slice(0, 4))
        : null,
      added_by: user.id,
    });

    setResults((prev) => prev.filter((m) => m.id !== movie.id));
    setAddingId(null);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search TMDB for a movie..."
          className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-[var(--pink)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 rounded-md border border-neutral-900 p-2">
          {results.slice(0, 8).map((movie) => (
            <div
              key={movie.id}
              className="flex items-center gap-3 rounded-md p-2 hover:bg-neutral-900"
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
              <button
                onClick={() => addPick(movie)}
                disabled={addingId === movie.id}
                className="rounded-md border border-[var(--pink)] px-3 py-1 text-xs font-medium text-[var(--pink)] transition hover:bg-[var(--pink)] hover:text-black disabled:opacity-50"
              >
                {addingId === movie.id ? "Adding..." : "Add pick"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
