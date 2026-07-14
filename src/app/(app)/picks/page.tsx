import Image from "next/image";
import Link from "next/link";
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

function personName(pick: PendingPick) {
  return pick.profiles?.display_name ?? pick.added_by_name ?? "Someone";
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

  const groups = new Map<string, PendingPick[]>();
  for (const pick of data ?? []) {
    const name = personName(pick);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(pick);
  }
  const sortedNames = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <h1 className="mb-6 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">Picks</h1>
      <AddPickForm />
      <div className="mt-8 flex flex-col gap-10">
        {sortedNames.map((name) => (
          <div key={name}>
            <h2 className="mb-3 text-sm font-[var(--font-display)] uppercase tracking-wide text-[var(--pink)]">
              {name}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {groups.get(name)!.map((pick) => (
                <Link
                  key={pick.id}
                  href={`/movie/${pick.id}`}
                  className="flex flex-col gap-2 transition hover:opacity-80"
                >
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
                </Link>
              ))}
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <p className="text-neutral-400">
            No pending picks yet — search above to add the first one.
          </p>
        )}
      </div>
    </div>
  );
}
