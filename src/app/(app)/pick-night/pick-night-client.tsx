"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wheel } from "./wheel";
import { RatingForm } from "./rating-form";

interface Member {
  profileId: string;
  displayName: string;
}

interface PendingPick {
  id: string;
  title: string;
  poster_path: string | null;
}

interface SessionRow {
  id: string;
  status: string;
}

export function PickNightClient({
  currentUserId,
  members,
  initialSession,
  pendingPicks,
}: {
  currentUserId: string;
  members: Member[];
  initialSession: SessionRow | null;
  pendingPicks: PendingPick[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState(initialSession);
  const [readyMap, setReadyMap] = useState<Record<string, boolean>>({});
  const [winner, setWinner] = useState<{
    pickId: string;
    seed: number;
  } | null>(null);
  const [stage, setStage] = useState<"gathering" | "spinning" | "rating">(
    "gathering"
  );
  const [ratedProfiles, setRatedProfiles] = useState<Set<string>>(new Set());

  // Load existing ready state + subscribe to realtime updates for this session.
  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    supabase
      .from("session_members")
      .select("profile_id, ready")
      .eq("session_id", session.id)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setReadyMap(Object.fromEntries(data.map((r) => [r.profile_id, r.ready])));
      });

    supabase
      .from("session_result")
      .select("winning_pick_id, seed")
      .eq("session_id", session.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setWinner({ pickId: data.winning_pick_id, seed: data.seed });
        setStage("spinning");
      });

    supabase
      .from("ratings")
      .select("profile_id")
      .eq("session_id", session.id)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setRatedProfiles(new Set(data.map((r) => r.profile_id)));
      });

    const channel = supabase
      .channel(`pick-night-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_members",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const row = payload.new as { profile_id: string; ready: boolean };
          setReadyMap((prev) => ({ ...prev, [row.profile_id]: row.ready }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_result",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const row = payload.new as { winning_pick_id: string; seed: number };
          setWinner({ pickId: row.winning_pick_id, seed: row.seed });
          setStage("spinning");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ratings",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const row = payload.new as { profile_id: string };
          setRatedProfiles((prev) => new Set(prev).add(row.profile_id));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session, supabase]);

  async function startPickNight() {
    const { data: newSession, error } = await supabase
      .from("sessions")
      .insert({ status: "gathering" })
      .select()
      .single();
    if (error || !newSession) return;

    await supabase.from("session_members").insert(
      members.map((m) => ({
        session_id: newSession.id,
        profile_id: m.profileId,
        ready: false,
      }))
    );

    setSession(newSession);
    setStage("gathering");
    setWinner(null);
    setRatedProfiles(new Set());
  }

  async function markReady() {
    if (!session) return;
    await supabase
      .from("session_members")
      .update({ ready: true })
      .eq("session_id", session.id)
      .eq("profile_id", currentUserId);
  }

  async function closeSession() {
    if (!session) return;
    await supabase
      .from("sessions")
      .update({ status: "closed" })
      .eq("id", session.id);
    setSession(null);
    setStage("gathering");
    setWinner(null);
    router.refresh();
  }

  const winningPick = winner
    ? pendingPicks.find((p) => p.id === winner.pickId)
    : null;

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          No pick night in progress
        </h1>
        <p className="text-sm text-neutral-400">
          Start one and everyone can ready up together.
        </p>
        <button
          onClick={startPickNight}
          className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110"
        >
          Start pick night
        </button>
      </div>
    );
  }

  if (stage === "gathering") {
    const allReady = members.every((m) => readyMap[m.profileId]);
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Waiting for everyone to be ready
        </h1>
        <ul className="flex flex-col gap-2">
          {members.map((m) => (
            <li
              key={m.profileId}
              className="flex w-64 items-center justify-between rounded-md border border-neutral-900 px-3 py-2"
            >
              <span className="text-sm text-neutral-200">
                {m.displayName}
              </span>
              <span
                className={`text-xs font-medium ${
                  readyMap[m.profileId] ? "text-[var(--pink)]" : "text-neutral-500"
                }`}
              >
                {readyMap[m.profileId] ? "Ready" : "Waiting"}
              </span>
            </li>
          ))}
        </ul>
        {!readyMap[currentUserId] && (
          <button
            onClick={markReady}
            className="rounded-md bg-[var(--pink)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110"
          >
            I&apos;m ready
          </button>
        )}
        {allReady && (
          <p className="text-sm text-neutral-400">
            Everyone&apos;s ready — spinning the wheel...
          </p>
        )}
      </div>
    );
  }

  if (stage === "spinning" && winner) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Spinning the wheel...
        </h1>
        <Wheel
          segments={pendingPicks.map((p) => ({ id: p.id, title: p.title }))}
          winningId={winner.pickId}
          seed={winner.seed}
          onSettled={() => setStage("rating")}
        />
      </div>
    );
  }

  if (stage === "rating" && winner) {
    const iRated = ratedProfiles.has(currentUserId);
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Tonight&apos;s pick: {winningPick?.title ?? "the film"}
        </h1>
        {!iRated ? (
          <RatingForm
            sessionId={session.id}
            pickId={winner.pickId}
            profileId={currentUserId}
            onSubmitted={() =>
              setRatedProfiles((prev) => new Set(prev).add(currentUserId))
            }
          />
        ) : (
          <p className="text-sm text-neutral-400">
            Thanks — waiting on {members.length - ratedProfiles.size} more
            rating(s).
          </p>
        )}
        <ul className="flex flex-wrap justify-center gap-2">
          {members.map((m) => (
            <li
              key={m.profileId}
              className={`rounded-full px-3 py-1 text-xs ${
                ratedProfiles.has(m.profileId)
                  ? "bg-[var(--pink)] text-black"
                  : "bg-neutral-900 text-neutral-500"
              }`}
            >
              {m.displayName}
            </li>
          ))}
        </ul>
        {ratedProfiles.size === members.length && (
          <button
            onClick={closeSession}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:bg-neutral-800"
          >
            Finish pick night
          </button>
        )}
      </div>
    );
  }

  return null;
}
