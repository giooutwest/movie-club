"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { simpleLogin } from "./actions";

export function SimpleLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await simpleLogin(email, name);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors focus:border-[var(--pink)] focus:outline-none"
      />
      <input
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors focus:border-[var(--pink)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--pink)] px-3 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? "Joining..." : "Enter the club"}
      </button>
      {error && (
        <p className="animate-fade-in text-sm text-red-400">{error}</p>
      )}
    </form>
  );
}
