"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function RatingForm({
  sessionId,
  pickId,
  profileId,
  onSubmitted,
}: {
  sessionId: string;
  pickId: string;
  profileId: string;
  onSubmitted: () => void;
}) {
  const [score, setScore] = useState(7);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (wordCount(review) < 5) {
      setError("Write at least 5 words about the film.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("ratings").insert({
      session_id: sessionId,
      pick_id: pickId,
      profile_id: profileId,
      score,
      review_text: review.trim(),
    });
    setSubmitting(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm text-neutral-300">Score: {score.toFixed(1)}</span>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="accent-[var(--pink)]"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm text-neutral-300">
          Your take (5+ words)
        </span>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-[var(--pink)] focus:outline-none"
          placeholder="What did you think?"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit rating"}
      </button>
    </form>
  );
}
