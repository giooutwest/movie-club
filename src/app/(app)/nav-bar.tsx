"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SoapLogo } from "@/components/soap-logo";

const LINKS = [
  { href: "/", label: "Rankings" },
  { href: "/picks", label: "Picks" },
  { href: "/pick-night", label: "Pick Night" },
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
    <header className="border-b border-neutral-900 bg-black">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" onClick={() => setOpen(false)}>
            <SoapLogo size="sm" />
          </Link>
          <nav className="hidden md:flex gap-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-wide transition ${
                  pathname === link.href
                    ? "text-[var(--pink)]"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {link.label}
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
            className="text-sm text-neutral-500 transition hover:text-neutral-300"
          >
            Sign out
          </button>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-neutral-300 md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <path
                d="M4 4L18 18M18 4L4 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6H19M3 11H19M3 16H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-neutral-900 px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-2 text-sm font-medium uppercase tracking-wide transition ${
                pathname === link.href
                  ? "text-[var(--pink)]"
                  : "text-neutral-500 hover:text-neutral-300"
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
              className="text-sm text-neutral-500 transition hover:text-neutral-300"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
