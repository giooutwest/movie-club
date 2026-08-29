"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { posterUrl } from "@/lib/tmdb/client";

interface PickListItemProps {
  id: string;
  title: string;
  poster_path: string | null;
  release_year: number | null;
  isOwner: boolean;
}

export function PickListItem({ id, title, poster_path, release_year, isOwner }: PickListItemProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (removing) return;
    setRemoving(true);
    const supabase = createClient();
    const { error } = await supabase.from("picks").delete().eq("id", id);
    if (error) {
      setRemoving(false);
      return;
    }
    router.refresh();
  }

  return (
    <Link
      href={`/movie/${id}`}
      className="group flex items-center gap-3 rounded-md py-2 pr-2 transition-colors hover:bg-neutral-900"
    >
      {posterUrl(poster_path, "w200") ? (
        <div className="h-[69px] w-[46px] shrink-0 overflow-hidden rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <Image
            src={posterUrl(poster_path, "w200")!}
            alt={title}
            width={46}
            height={69}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-[69px] w-[46px] shrink-0 rounded bg-neutral-800" />
      )}
      <p className="flex-1 text-sm font-medium text-neutral-100 transition-colors group-hover:text-[var(--pink)]">
        {title}
        {release_year && <span className="ml-1 text-neutral-500">({release_year})</span>}
      </p>
      {isOwner && (
        <button
          onClick={handleRemove}
          disabled={removing}
          className="rounded-md border border-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:bg-neutral-800 hover:text-neutral-100 active:scale-95 disabled:opacity-50"
        >
          {removing ? "Removing..." : "Remove"}
        </button>
      )}
    </Link>
  );
}
