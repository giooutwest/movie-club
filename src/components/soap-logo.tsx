import Image from "next/image";

const SIZES = {
  sm: { w: 128, h: 46, text: "text-[13px]" },
  lg: { w: 250, h: 92, text: "text-3xl" },
} as const;

export function SoapLogo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const s = SIZES[size];
  return (
    <div
      className="relative select-none shrink-0"
      style={{ width: s.w, height: s.h }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[10px]"
        style={{
          transform: "rotate(-6deg)",
          boxShadow:
            "0 3px 10px rgba(0,0,0,0.55), inset 0 3px 2px rgba(255,255,255,0.35), inset 0 -5px 8px rgba(0,0,0,0.4), inset 3px 0 4px rgba(255,255,255,0.1), inset -3px 0 4px rgba(0,0,0,0.25)",
        }}
      >
        {/* Real soap-bar photo for authentic, hyper-real surface texture */}
        <Image
          src="/soap-bar.png"
          alt=""
          fill
          sizes={`${s.w}px`}
          className="object-cover"
          priority
        />

        {/* Tint the photo pink while keeping its natural shading/texture */}
        <div
          className="absolute inset-0"
          style={{ background: "#ff2f92", mixBlendMode: "color" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(255,47,146,0.35)", mixBlendMode: "multiply" }}
        />

        {/* Fine grain for extra material realism */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
            mixBlendMode: "overlay",
          }}
        />

        {/* Specular gloss, upper-left light source */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 22% 15%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0) 55%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(140% 100% at 80% 100%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 45%)",
          }}
        />

        {/* Engraved "MOVIE CLUB" stamp, sitting level within the crooked bar */}
        <span
          className={`relative whitespace-nowrap font-[var(--font-display)] uppercase tracking-[0.16em] ${s.text}`}
          style={{
            color: "rgba(120, 12, 66, 0.55)",
            textShadow:
              "1px 1px 0.5px rgba(255,255,255,0.75), -1px -1px 1px rgba(60,6,33,0.7), 0 0 1px rgba(60,6,33,0.4)",
          }}
        >
          Movie Club
        </span>
      </div>
    </div>
  );
}
