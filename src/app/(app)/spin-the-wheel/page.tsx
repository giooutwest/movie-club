import { createClient } from "@/lib/supabase/server";
import { SpinWheelClient } from "./spin-wheel-client";

export default async function SpinTheWheelPage() {
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

  const { data: pendingPicksData } = await supabase
    .from("picks")
    .select("id, title, poster_path, release_year")
    .eq("status", "pending");

  const pendingPicks = pendingPicksData ?? [];

  // A winner already picked (e.g. the page was reloaded after deciding)
  // flips that pick to 'watched', which drops it out of the query above --
  // make sure it's still available so the wheel/result screen can show it.
  if (session) {
    const { data: result } = await supabase
      .from("session_result")
      .select("winning_pick_id")
      .eq("session_id", session.id)
      .maybeSingle();

    if (result && !pendingPicks.some((p) => p.id === result.winning_pick_id)) {
      const { data: winningPick } = await supabase
        .from("picks")
        .select("id, title, poster_path, release_year")
        .eq("id", result.winning_pick_id)
        .single();
      if (winningPick) pendingPicks.push(winningPick);
    }
  }

  return (
    <SpinWheelClient
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
