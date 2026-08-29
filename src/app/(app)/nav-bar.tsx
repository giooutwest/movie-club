"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SoapLogo } from "@/components/soap-logo";

const LINKS = [
  { href: "/", label: "Rankings" },
  { href: "/picks", label: "Picks" },
  { href: "/spin-the-wheel", label: "Spin the Wheel" },
  { href: "/settings", label: "Settings" },
];

export function NavBar({ displayName }: { displayName: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-neutral-900 bg-black/90 backdrop-blur-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" onClick={() => setOpen(false)} className="transition-transform active:scale-95">
            <SoapLogo size="sm" />
          </Link>
          <nav className="hidden md:flex gap-5">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium uppercase tracking-wide transition-colors ${
                  pathname === link.href
                    ? "text-[var(--pink)]"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-[13px] left-0 h-[2px] w-full bg-[var(--pink)] transition-transform duration-300 ease-out ${
                    pathname === link.href ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {displayName && (
            <span className="text-sm text-neutral-500">{displayName}</span>
          )}
          <button
            onClick={signOut}
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-300"
          >
            Sign out
          </button>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center text-neutral-300 md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M3 6H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`origin-center transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`}
            />
            <path
              d="M3 11H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"}`}
            />
            <path
              d="M3 16H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`origin-center transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
            />
          </svg>
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 border-t border-neutral-900 px-4 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                  pathname === link.href
                    ? "text-[var(--pink)]"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-neutral-900 pt-3">
              {displayName && (
                <span className="text-sm text-neutral-500">{displayName}</span>
              )}
              <button
                onClick={signOut}
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
