import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { posterUrl } from "@/lib/tmdb/client";
import { AddPickForm } from "./add-pick-form";

interface PendingPick {
  id: string;
  title: string;
  poster_path: string | null;
  release_year: number | null;
  added_by: string | null;
  added_by_name: string | null;
  profiles: { display_name: string } | null;
}

export default async function PicksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("picks")
    .select(
      "id, title, poster_path, release_year, added_by, added_by_name, profiles(display_name)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .returns<PendingPick[]>();

  return (
    <div>
      <h1 className="mb-6 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">Picks</h1>
      <AddPickForm />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {(data ?? []).map((pick) => (
          <div key={pick.id} className="flex flex-col gap-2">
            {posterUrl(pick.poster_path, "w342") ? (
              <Image
                src={posterUrl(pick.poster_path, "w342")!}
                alt={pick.title}
                width={171}
                height={256}
                className="rounded-md"
              />
            ) : (
              <div className="aspect-[2/3] rounded-md bg-neutral-800" />
            )}
            <p className="text-sm font-medium text-neutral-100">
              {pick.title}
              {pick.release_year && (
                <span className="ml-1 text-neutral-500">
                  ({pick.release_year})
                </span>
              )}
            </p>
            <p className="text-xs text-neutral-500">
              picked by{" "}
              {pick.profiles?.display_name ?? pick.added_by_name ?? "someone"}
            </p>
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <p className="col-span-full text-neutral-400">
            No pending picks yet — search above to add the first one.
          </p>
        )}
      </div>
    </div>
  );
}
