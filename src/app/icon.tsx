import { ImageResponse } from "next/og";
import { PINK, PINK_DIM, PINK_LIGHT } from "@/lib/theme-colors";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "999px",
          background: `linear-gradient(155deg, ${PINK_LIGHT} 0%, ${PINK} 45%, ${PINK_DIM} 100%)`,
        }}
      >
        <span
          style={{
            display: "flex",
            transform: "rotate(-13deg)",
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(120, 12, 66, 0.6)",
            textShadow:
              "1px 1px 0.5px rgba(255,255,255,0.7), -1px -1px 1px rgba(60,6,33,0.6)",
          }}
        >
          MC
        </span>
      </div>
    ),
    size
  );
}
