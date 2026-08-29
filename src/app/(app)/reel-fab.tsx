"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PINK, PINK_DIM, PINK_LIGHT } from "@/lib/theme-colors";

function ReelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
      <circle cx="12" cy="12" r="10" opacity={0.15} />
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth={1.2} />
      <circle cx="12" cy="6.2" r="2" />
      <circle cx="17.3" cy="9.9" r="2" />
      <circle cx="15.3" cy="16.1" r="2" />
      <circle cx="8.7" cy="16.1" r="2" />
      <circle cx="6.7" cy="9.9" r="2" />
      <circle cx="12" cy="12" r="2.2" fill="black" />
    </svg>
  );
}

export function ReelFab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed right-6 z-50 flex flex-col items-end gap-3"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      {open && (
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/spin-the-wheel");
            }}
            className="animate-fade-up stagger-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-lg ring-1 ring-neutral-800 transition-all hover:bg-neutral-800 active:scale-95"
          >
            🎡 Spin the wheel
          </button>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/log");
            }}
            className="animate-fade-up stagger-1 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-lg ring-1 ring-neutral-800 transition-all hover:bg-neutral-800 active:scale-95"
          >
            🎬 Log a movie
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Quick actions"
        className={`flex h-14 w-14 items-center justify-center rounded-full text-black shadow-xl transition-transform duration-300 active:scale-90 ${
          open ? "rotate-45" : "hover:scale-105"
        }`}
        style={{
          background: `linear-gradient(155deg, ${PINK_LIGHT} 0%, ${PINK} 42%, ${PINK_DIM} 100%)`,
        }}
      >
        <ReelIcon />
      </button>
    </div>
  );
}
