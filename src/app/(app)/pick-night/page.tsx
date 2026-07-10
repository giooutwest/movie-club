import { createClient } from "@/lib/supabase/server";
import { PickNightClient } from "./pick-night-client";

export default async function PickNightPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, profiles(display_name)")
    .eq("active", true);

  const { data: session } = await supabase
    .from("sessions")
    .select("id, status")
    .neq("status", "closed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: pendingPicks } = await supabase
    .from("picks")
    .select("id, title, poster_path")
    .eq("status", "pending");

  return (
    <PickNightClient
      currentUserId={user!.id}
      members={
        (members ?? []).map((m) => ({
          profileId: m.profile_id,
          // @ts-expect-error - supabase typing for joined relation
          displayName: m.profiles?.display_name ?? "member",
        })) as { profileId: string; displayName: string }[]
      }
      initialSession={session ?? null}
      pendingPicks={pendingPicks ?? []}
    />
  );
}
