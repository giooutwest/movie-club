"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteMember } from "./actions";

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const result = await inviteMember(email);
    if (result.error) {
      setError(result.error);
      setStatus("error");
      return;
    }
    setEmail("");
    setStatus("idle");
    setError(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="friend@example.com"
        className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors focus:border-[var(--pink)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {status === "sending" ? "Inviting..." : "Invite"}
      </button>
      {error && <p className="animate-fade-in text-sm text-red-400">{error}</p>}
    </form>
  );
}
