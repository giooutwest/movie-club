import { createClient } from "@/lib/supabase/server";
import { AddPickForm } from "./add-pick-form";
import { PickListItem } from "./pick-list-item";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ownDisplayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    ownDisplayName = profile?.display_name ?? null;
  }

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

  function isOwnPick(pick: PendingPick) {
    return pick.added_by === user?.id || (pick.added_by === null && pick.added_by_name === ownDisplayName);
  }

  const ownPick = data?.find(isOwnPick);
  const ownName = ownPick ? personName(ownPick) : null;

  const otherNames = [...groups.keys()]
    .filter((name) => name !== ownName)
    .sort((a, b) => a.localeCompare(b));
  const orderedNames = ownName ? [ownName, ...otherNames] : otherNames;

  return (
    <div className="animate-fade-up">
      <h1 className="mb-6 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">Picks</h1>
      <AddPickForm />
      <div className="mt-8 flex flex-col gap-10">
        {orderedNames.map((name, groupIndex) => (
          <div
            key={name}
            className={`animate-fade-up stagger-${Math.min(groupIndex + 1, 4)}`}
          >
            <h2 className="mb-3 text-sm font-[var(--font-display)] uppercase tracking-wide text-[var(--pink)]">
              {name === ownName ? "Your Picks" : name}
            </h2>
            <div className="flex flex-col divide-y divide-neutral-900">
              {groups.get(name)!.map((pick) => (
                <PickListItem
                  key={pick.id}
                  id={pick.id}
                  title={pick.title}
                  poster_path={pick.poster_path}
                  release_year={pick.release_year}
                  isOwner={isOwnPick(pick)}
                />
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
