"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveDisplayName } from "./actions";

export function WelcomeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await saveDisplayName(name);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/add-to-home-screen");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
      <input
        autoFocus
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-3 text-center text-lg text-neutral-100 placeholder:text-neutral-600 transition-colors focus:border-[var(--pink)] focus:outline-none"
      />
      {error && <p className="animate-fade-in text-center text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--pink)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
