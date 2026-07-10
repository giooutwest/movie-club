"use client";

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
          <Link href="/">
            <SoapLogo size="sm" />
          </Link>
          <nav className="flex gap-4">
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
        <div className="flex items-center gap-3">
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
    </header>
  );
}
