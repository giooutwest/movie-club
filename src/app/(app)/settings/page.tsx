import { createClient } from "@/lib/supabase/server";
import { RenameForm } from "./rename-form";

interface MemberRow {
  profile_id: string;
  active: boolean;
  profiles: { display_name: string } | null;
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, active, profiles(display_name)")
    .returns<MemberRow[]>();

  const { data: myProfile } = user
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div className="animate-fade-up flex flex-col gap-8">
      {user && myProfile && (
        <div>
          <h1 className="mb-4 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
            Your profile
          </h1>
          <RenameForm userId={user.id} currentName={myProfile.display_name} />
        </div>
      )}
      <div>
        <h1 className="mb-4 text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Club members
        </h1>
        <ul className="flex flex-col gap-2">
          {(members ?? []).map((m) => (
            <li
              key={m.profile_id}
              className="flex items-center justify-between rounded-md border border-neutral-900 px-3 py-2 transition-colors hover:border-neutral-700"
            >
              <span className="text-sm text-neutral-200">
                {m.profiles?.display_name ?? "member"}
              </span>
              <span
                className={`text-xs ${
                  m.active ? "text-[var(--pink)]" : "text-neutral-500"
                }`}
              >
                {m.active ? "active" : "inactive"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-neutral-500">
          Friends join themselves — just send them the site link and have
          them enter their email and name.
        </p>
      </div>
    </div>
  );
}
