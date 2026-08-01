"use client";

import { useEffect, useState } from "react";
import changelog from "@/data/changelog.json";

const STORAGE_KEY = "movie-club-last-seen-version";

export function UpdateScreen() {
  const [visible, setVisible] = useState(false);
  const latest = changelog[changelog.length - 1];

  useEffect(() => {
    if (!latest) return;
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen === latest.version) return;

    // Let the splash screen have the stage first.
    const timer = setTimeout(() => setVisible(true), 2300);
    return () => clearTimeout(timer);
  }, [latest]);

  function dismiss() {
    if (latest) localStorage.setItem(STORAGE_KEY, latest.version);
    setVisible(false);
  }

  if (!visible || !latest) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="animate-scale-in flex w-full max-w-sm flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-6">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          What&apos;s new
        </p>
        <h1 className="text-xl font-[var(--font-display)] uppercase tracking-wide text-[var(--pink)]">
          v{latest.version}
        </h1>
        <ul className="flex flex-col gap-2 text-sm text-neutral-300">
          {latest.notes.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="text-[var(--pink)]">-</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={dismiss}
          className="mt-2 rounded-md bg-[var(--pink)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
