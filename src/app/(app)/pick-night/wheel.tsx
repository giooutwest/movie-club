"use client";

import { useEffect, useState } from "react";

interface WheelSegment {
  id: string;
  title: string;
}

const COLORS = ["#0a0a0a", "#ff2f92"];

export function Wheel({
  segments,
  winningId,
  seed,
  onSettled,
}: {
  segments: WheelSegment[];
  winningId: string;
  seed: number;
  onSettled: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const n = segments.length;
  const segmentAngle = 360 / n;
  const winningIndex = Math.max(
    0,
    segments.findIndex((s) => s.id === winningId)
  );

  useEffect(() => {
    // Deterministic across every client: same seed -> same number of spins,
    // and the winning index always determines the final resting angle.
    const extraSpins = 4 + Math.floor(seed * 4); // 4-7 full rotations
    const targetSliceCenter = winningIndex * segmentAngle + segmentAngle / 2;
    // Pointer is fixed at the top (0deg); rotate so the winning slice ends up there.
    const finalAngle = 360 * extraSpins + (360 - targetSliceCenter);

    const raf = requestAnimationFrame(() => setRotation(finalAngle));
    const timeout = setTimeout(onSettled, 5200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gradient = segments
    .map((_, i) => {
      const from = i * segmentAngle;
      const to = from + segmentAngle;
      return `${COLORS[i % COLORS.length]} ${from}deg ${to}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-80 w-80">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-[var(--pink)]" />
        </div>
        <div
          className="h-full w-full rounded-full border-4 border-[var(--pink)] shadow-[0_0_30px_rgba(255,47,146,0.35)] transition-transform duration-[5000ms] ease-out"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {segments.map((s, i) => (
            <div
              key={s.id}
              className="absolute left-1/2 top-1/2 w-32 origin-left text-[11px] font-bold uppercase tracking-wide text-white"
              style={{
                transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)`,
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              <span className="ml-4 block max-w-[100px] truncate">
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
