"use client";

import { useState } from "react";

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export function Instructions() {
  // Rendered client-only (see page.tsx's ssr:false dynamic import), so
  // navigator.userAgent is always available here — no effect needed.
  const [isIOS] = useState(() =>
    /iPhone|iPad|iPod/.test(window.navigator.userAgent)
  );

  if (isIOS) {
    return (
      <ol className="flex w-full max-w-sm flex-col gap-3 text-left text-sm text-neutral-300">
        <li className="flex items-center gap-3 rounded-md border border-neutral-900 px-4 py-3">
          <ShareIcon />
          <span>
            Tap the <span className="text-neutral-100">Share</span> button
            in Safari&apos;s toolbar
          </span>
        </li>
        <li className="flex items-center gap-3 rounded-md border border-neutral-900 px-4 py-3">
          <span className="font-[var(--font-display)] text-[var(--pink)]">
            +
          </span>
          <span>
            Scroll down and tap{" "}
            <span className="text-neutral-100">Add to Home Screen</span>
          </span>
        </li>
        <li className="flex items-center gap-3 rounded-md border border-neutral-900 px-4 py-3">
          <span className="font-[var(--font-display)] text-[var(--pink)]">
            ✓
          </span>
          <span>
            Confirm the name and tap{" "}
            <span className="text-neutral-100">Add</span> — leave{" "}
            <span className="text-neutral-100">Open as Web App</span> on if
            you see that toggle
          </span>
        </li>
      </ol>
    );
  }

  return (
    <ol className="flex w-full max-w-sm flex-col gap-3 text-left text-sm text-neutral-300">
      <li className="flex items-center gap-3 rounded-md border border-neutral-900 px-4 py-3">
        <span>
          Open the browser menu (usually the{" "}
          <span className="text-neutral-100">⋮</span> icon)
        </span>
      </li>
      <li className="flex items-center gap-3 rounded-md border border-neutral-900 px-4 py-3">
        <span>
          Tap <span className="text-neutral-100">Add to Home screen</span> or{" "}
          <span className="text-neutral-100">Install app</span>
        </span>
      </li>
    </ol>
  );
}
