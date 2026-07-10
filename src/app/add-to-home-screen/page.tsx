"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { SoapLogo } from "@/components/soap-logo";

const Instructions = dynamic(
  () => import("./instructions").then((mod) => mod.Instructions),
  { ssr: false }
);

export default function AddToHomeScreenPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-4 text-center">
      <SoapLogo size="lg" />
      <div className="max-w-sm">
        <h1 className="font-[var(--font-display)] text-2xl uppercase tracking-wide text-neutral-100">
          Put it on your home screen
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Movie Club works best as an app icon, not a bookmark.
        </p>
      </div>

      <Instructions />

      <button
        onClick={() => router.push("/")}
        className="rounded-md bg-[var(--pink)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110"
      >
        Continue
      </button>
    </main>
  );
}
