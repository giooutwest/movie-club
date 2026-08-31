"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatRuntime, posterUrl } from "@/lib/tmdb/client";
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
  release_year: number | null;
  tmdb_id: number;
}

interface SessionRow {
  id: string;
  status: string;
}

interface Winner {
  pickId: string;
  seed: number;
}

export function SpinWheelClient({
  currentUserId,
  members,
  initialSession,
  initialWinner,
  pendingPicks,
}: {
  currentUserId: string;
  members: Member[];
  initialSession: SessionRow | null;
  initialWinner: Winner | null;
  pendingPicks: PendingPick[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState(initialSession);
  const [winner, setWinner] = useState<Winner | null>(initialWinner);
  // A winner is already decided when this page loads (e.g. reopening the
  // app mid-session) -- jump straight to the result instead of defaulting
  // to "gathering" and flashing over once the client re-fetches the same
  // data a moment later.
  const [stage, setStage] = useState<
    "gathering" | "spinning" | "result" | "rating"
  >(initialWinner ? "result" : "gathering");
  const [ratedProfiles, setRatedProfiles] = useState<Set<string>>(new Set());
  const [runtime, setRuntime] = useState<string | null>(null);
  const [spinningAgain, setSpinningAgain] = useState(false);
  const [starting, setStarting] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  // Load existing ratings + subscribe to realtime updates for this session.
  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    supabase
      .from("ratings")
      .select("profile_id")
      .eq("session_id", session.id)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setRatedProfiles(new Set(data.map((r) => r.profile_id)));
      });

    const channel = supabase
      .channel(`spin-the-wheel-${session.id}`)
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
          setWinner((prev) => {
            if (prev && prev.pickId !== row.winning_pick_id) {
              setRatedProfiles(new Set());
            }
            return { pickId: row.winning_pick_id, seed: row.seed };
          });
          setSpinningAgain(false);
          setStarting(false);
          setStage("spinning");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "session_result",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          // spin_again updates the existing result row in place rather
          // than inserting a new one.
          const row = payload.new as { winning_pick_id: string; seed: number };
          setWinner((prev) => {
            if (prev && prev.pickId !== row.winning_pick_id) {
              setRatedProfiles(new Set());
            }
            return { pickId: row.winning_pick_id, seed: row.seed };
          });
          setSpinningAgain(false);
          setStarting(false);
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

  async function spin() {
    setStarting(true);
    let sessionId = session?.id;
    if (!sessionId) {
      const { data: newSession, error } = await supabase
        .from("sessions")
        .insert({ status: "gathering" })
        .select()
        .single();
      if (error || !newSession) {
        setStarting(false);
        return;
      }
      setSession(newSession);
      setWinner(null);
      setRatedProfiles(new Set());
      sessionId = newSession.id;
    }

    const { error } = await supabase.rpc("attempt_decide_winner", {
      p_session_id: sessionId,
    });
    if (error) {
      setStarting(false);
      return;
    }
    // Don't rely solely on the realtime round-trip for the client that
    // triggered this -- fetch the fresh result directly so the UI is
    // guaranteed to update even if the postgres_changes event lags.
    const { data } = await supabase
      .from("session_result")
      .select("winning_pick_id, seed")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (data) {
      setWinner({ pickId: data.winning_pick_id, seed: data.seed });
      setStage("spinning");
    }
    setStarting(false);
  }

  async function spinAgain() {
    if (!session) return;
    setSpinningAgain(true);
    const { error } = await supabase.rpc("spin_again", {
      p_session_id: session.id,
    });
    if (error) {
      setSpinningAgain(false);
      return;
    }
    const { data } = await supabase
      .from("session_result")
      .select("winning_pick_id, seed")
      .eq("session_id", session.id)
      .maybeSingle();
    if (data) {
      setWinner((prev) => {
        if (prev && prev.pickId !== data.winning_pick_id) {
          setRatedProfiles(new Set());
        }
        return { pickId: data.winning_pick_id, seed: data.seed };
      });
      setStage("spinning");
    }
    setSpinningAgain(false);
  }

  async function endSession() {
    if (!session) return;
    setEndingSession(true);
    await supabase.rpc("close_session", { p_session_id: session.id });
    setSession(null);
    setStage("gathering");
    setWinner(null);
    setEndingSession(false);
    router.refresh();
  }

  const winningPick = winner
    ? pendingPicks.find((p) => p.id === winner.pickId)
    : null;

  // Fetch the winning pick's runtime for display -- how long it actually
  // is matters more when you're deciding whether to start it right now.
  useEffect(() => {
    let cancelled = false;
    if (!winningPick) {
      Promise.resolve().then(() => {
        if (!cancelled) setRuntime(null);
      });
      return () => {
        cancelled = true;
      };
    }
    fetch(`/api/tmdb/movie/${winningPick.tmdb_id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setRuntime(formatRuntime(data?.runtime));
      })
      .catch(() => {
        if (!cancelled) setRuntime(null);
      });
    return () => {
      cancelled = true;
    };
  }, [winningPick]);

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          No spin in progress
        </h1>
        <p className="text-sm text-neutral-400">
          Anyone can spin whenever they&apos;re ready.
        </p>
        <button
          onClick={spin}
          disabled={starting}
          className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {starting ? "Spinning..." : "Spin the wheel"}
        </button>
      </div>
    );
  }

  if (stage === "gathering") {
    return (
      <div className="animate-fade-up flex flex-col items-center gap-6 py-12">
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          Ready to spin
        </h1>
        <button
          onClick={spin}
          disabled={starting}
          className="animate-scale-in rounded-md bg-[var(--pink)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {starting ? "Spinning..." : "Spin the wheel"}
        </button>
        <button
          onClick={endSession}
          disabled={endingSession}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (stage === "spinning" && winner) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          {spinningAgain ? "Spinning again..." : "Spinning the wheel..."}
        </h1>
        <Wheel
          key={`${winner.pickId}-${winner.seed}`}
          segments={pendingPicks.map((p) => ({ id: p.id, title: p.title }))}
          winningId={winner.pickId}
          seed={winner.seed}
          onSettled={() => setStage("result")}
        />
      </div>
    );
  }

  if (stage === "result" && winner) {
    return (
      <div className="animate-scale-in flex flex-col items-center gap-6 py-8 text-center">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          Tonight&apos;s pick
        </p>
        {posterUrl(winningPick?.poster_path ?? null, "w342") ? (
          <Image
            src={posterUrl(winningPick!.poster_path, "w342")!}
            alt={winningPick?.title ?? "the film"}
            width={200}
            height={300}
            className="rounded-md shadow-[0_16px_40px_rgba(255,47,146,0.25)]"
            priority
          />
        ) : (
          <div className="h-[300px] w-[200px] rounded-md bg-neutral-900" />
        )}
        <h1 className="text-2xl font-[var(--font-display)] uppercase tracking-wide text-neutral-100">
          {winningPick?.title ?? "the film"}
          {winningPick?.release_year && (
            <span className="ml-2 text-neutral-500">
              ({winningPick.release_year})
            </span>
          )}
        </h1>
        {runtime && (
          <p className="-mt-4 text-sm text-neutral-500">{runtime}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={spinAgain}
            disabled={spinningAgain}
            className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-neutral-100 transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50"
          >
            {spinningAgain ? "Spinning..." : "Spin again"}
          </button>
          <button
            onClick={() => setStage("rating")}
            className="rounded-md bg-[var(--pink)] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Pick!
          </button>
        </div>
        <button
          onClick={endSession}
          disabled={endingSession}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-300 disabled:opacity-50"
        >
          {endingSession ? "Ending..." : "Start over"}
        </button>
      </div>
    );
  }

  if (stage === "rating" && winner) {
    const iRated = ratedProfiles.has(currentUserId);
    return (
      <div className="animate-fade-up flex flex-col items-center gap-6 py-8">
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
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                ratedProfiles.has(m.profileId)
                  ? "bg-[var(--pink)] text-black"
                  : "bg-neutral-900 text-neutral-500"
              }`}
            >
              {m.displayName}
            </li>
          ))}
        </ul>
        <button
          onClick={endSession}
          disabled={endingSession}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50"
        >
          {endingSession
            ? "Ending..."
            : ratedProfiles.size === members.length
              ? "Finish"
              : "Start over"}
        </button>
      </div>
    );
  }

  return null;
}
