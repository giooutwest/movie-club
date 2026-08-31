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
    .select("id, title, poster_path, release_year, tmdb_id")
    .eq("status", "pending");

  const pendingPicks = pendingPicksData ?? [];

  // A winner is already decided when reloading mid-session (e.g. the app
  // was closed and reopened) -- fetch it up front and pass it down so the
  // client can render the correct stage immediately, instead of always
  // starting on the "gathering" screen and flashing over to it a moment
  // later once it fetches this same data itself.
  let initialWinner: { pickId: string; seed: number } | null = null;

  if (session) {
    const { data: result } = await supabase
      .from("session_result")
      .select("winning_pick_id, seed")
      .eq("session_id", session.id)
      .maybeSingle();

    if (result) {
      initialWinner = { pickId: result.winning_pick_id, seed: result.seed };

      // That winning pick flips to 'watched', which drops it out of the
      // pending query above -- make sure it's still available so the
      // wheel/result screen can show it.
      if (!pendingPicks.some((p) => p.id === result.winning_pick_id)) {
        const { data: winningPick } = await supabase
          .from("picks")
          .select("id, title, poster_path, release_year, tmdb_id")
          .eq("id", result.winning_pick_id)
          .single();
        if (winningPick) pendingPicks.push(winningPick);
      }
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
      initialWinner={initialWinner}
      pendingPicks={pendingPicks ?? []}
    />
  );
}
