const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY!);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return fetch(url, { next: { revalidate: 60 * 60 } }).then((res) => {
    if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
    return res.json();
  });
}

export function posterUrl(path: string | null, size: "w200" | "w342" | "w500" = "w342") {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export function searchMovies(query: string) {
  return tmdbFetch("/search/movie", { query, include_adult: "false" }) as Promise<{
    results: TmdbSearchResult[];
  }>;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  runtime: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
}

export function getMovieDetails(tmdbId: number) {
  return tmdbFetch(`/movie/${tmdbId}`, {
    append_to_response: "credits",
  }) as Promise<TmdbMovieDetails>;
}
