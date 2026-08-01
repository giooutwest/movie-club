import type { SupabaseClient } from "@supabase/supabase-js";

interface MovieInput {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
}

export type FindOrCreatePickResult =
  | { id: string; alreadyExisted: true; status: "pending" | "watched" }
  | { id: string; alreadyExisted: false }
  | { error: string };

export async function findOrCreatePick(
  supabase: SupabaseClient,
  movie: MovieInput,
  addedBy: string
): Promise<FindOrCreatePickResult> {
  const { data: existing } = await supabase
    .from("picks")
    .select("id, status")
    .eq("tmdb_id", movie.id)
    .maybeSingle();

  if (existing) {
    return { id: existing.id, alreadyExisted: true, status: existing.status };
  }

  const { data: created, error } = await supabase
    .from("picks")
    .insert({
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_year: movie.release_date
        ? Number(movie.release_date.slice(0, 4))
        : null,
      added_by: addedBy,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: error?.message ?? "Could not add pick." };
  }
  return { id: created.id, alreadyExisted: false };
}
