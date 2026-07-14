"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <p className="animate-scale-in rounded-md bg-neutral-900 p-4 text-sm text-neutral-300">
        Check <span className="font-medium text-neutral-100">{email}</span>{" "}
        for a magic link to finish signing in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors focus:border-[var(--pink)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-[var(--pink)] px-3 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {status === "sending" ? "Sending link..." : "Send magic link"}
      </button>
      {status === "error" && (
        <p className="animate-fade-in text-sm text-red-400">
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
