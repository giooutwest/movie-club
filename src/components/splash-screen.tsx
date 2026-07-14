"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Magic-link emails always open in a regular browser tab, never inside the
// installed home-screen app, and iOS gives a home-screen web app separate
// storage from Safari -- gating these would make it impossible to ever log
// in. Only the main app experience is gated behind "add to home screen".
const EXEMPT_PATHS = [
  "/add-to-home-screen",
  "/login",
  "/auth/callback",
  "/welcome",
];

export function SplashScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (EXEMPT_PATHS.some((path) => pathname.startsWith(path))) return;

    if (!isRunningStandalone()) {
      router.replace("/add-to-home-screen");
      return;
    }

    if (sessionStorage.getItem("movie-club-splash-shown")) return;
    sessionStorage.setItem("movie-club-splash-shown", "1");
    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), 1600);
    const hideTimer = setTimeout(() => setVisible(false), 2150);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname, router]);

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
