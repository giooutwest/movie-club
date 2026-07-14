import Image from "next/image";

const SIZES = {
  sm: { w: 108, h: 44, radius: 10, text: "text-[11px]" },
  lg: { w: 220, h: 90, radius: 18, text: "text-2xl" },
} as const;

export function SoapLogo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const s = SIZES[size];
  return (
    <div
      className="relative flex select-none items-center justify-center overflow-hidden shrink-0"
      style={{
        width: s.w,
        height: s.h,
        borderRadius: s.radius,
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.3), inset 2px 0 0 rgba(255,255,255,0.12), inset -2px 0 0 rgba(0,0,0,0.2)",
      }}
    >
      <Image
        src="/soap-bar.png"
        alt="Movie Club"
        fill
        sizes={`${s.w}px`}
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative flex flex-col items-center leading-none">
        <span
          className={`font-[var(--font-display)] uppercase tracking-[0.14em] text-[#e8629c] ${s.text}`}
          style={{
            textShadow:
              "0 1px 0 rgba(255,255,255,0.8), 0 -1px 0 rgba(93,20,54,0.6), 0 2px 3px rgba(93,20,54,0.45)",
          }}
        >
          Movie
        </span>
        <span
          className={`font-[var(--font-display)] uppercase tracking-[0.14em] text-[#e8629c] ${s.text}`}
          style={{
            textShadow:
              "0 1px 0 rgba(255,255,255,0.8), 0 -1px 0 rgba(93,20,54,0.6), 0 2px 3px rgba(93,20,54,0.45)",
          }}
        >
          Club
        </span>
      </div>
    </div>
  );
}
