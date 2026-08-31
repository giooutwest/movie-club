"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WatchedWithGroupCheckbox } from "@/components/watched-with-group-checkbox";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function RateForm({ pickId }: { pickId: string }) {
  const router = useRouter();
  const [score, setScore] = useState(7);
  const [review, setReview] = useState("");
  const [watchedWithGroup, setWatchedWithGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const words = wordCount(review);
    if (words > 0 && words < 5) {
      setError("Either leave it blank or write at least 5 words.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("rate_pick", {
      p_pick_id: pickId,
      p_score: score,
      p_review_text: review.trim() || null,
      p_watched_with_group: watchedWithGroup,
    });
    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm text-neutral-300">
          Score:{" "}
          <span className="font-semibold text-[var(--pink)]">{score.toFixed(1)}</span>
        </span>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="accent-[var(--pink)] transition-transform active:scale-y-125"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm text-neutral-300">Your take (optional, 5+ words)</span>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors focus:border-[var(--pink)] focus:outline-none"
          placeholder="What did you think? (optional)"
        />
      </label>
      <WatchedWithGroupCheckbox checked={watchedWithGroup} onChange={setWatchedWithGroup} />
      {error && <p className="animate-fade-in text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit rating"}
      </button>
    </form>
  );
}
