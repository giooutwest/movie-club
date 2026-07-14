"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("movie-club-splash-shown")) return;
    sessionStorage.setItem("movie-club-splash-shown", "1");
    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), 1600);
    const hideTimer = setTimeout(() => setVisible(false), 2150);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black px-6 transition-opacity duration-500 ease-out ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p className="max-w-sm animate-fade-up text-center text-lg font-[var(--font-display)] uppercase leading-relaxed tracking-wide text-neutral-100 sm:text-xl">
        The first rule of Movie Club is you don&apos;t talk about Movie Club.
      </p>
    </div>
  );
}
