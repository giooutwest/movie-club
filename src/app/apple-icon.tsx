import { ImageResponse } from "next/og";
import { PINK, PINK_DIM, PINK_LIGHT } from "@/lib/theme-colors";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const engraved = {
  color: "rgba(120, 12, 66, 0.65)",
  textShadow:
    "1px 1px 0.5px rgba(255,255,255,0.75), -1px -1px 1px rgba(60,6,33,0.7)",
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <div
          style={{
            width: "88%",
            height: "88%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "999px",
            background: `radial-gradient(circle at 32% 26%, ${PINK_LIGHT} 0%, #ff5fa8 24%, ${PINK} 52%, ${PINK_DIM} 100%)`,
            boxShadow:
              "inset 0 8px 12px rgba(255,255,255,0.45), inset 0 -12px 20px rgba(0,0,0,0.4), inset 6px 0 10px rgba(255,255,255,0.12), inset -6px 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: "rotate(-16deg)",
            }}
          >
            <span
              style={{
                display: "flex",
                whiteSpace: "nowrap",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                ...engraved,
              }}
            >
              Movie
            </span>
            <div
              style={{
                display: "flex",
                width: 92,
                height: 3,
                marginTop: 6,
                marginBottom: 6,
                background: "rgba(120, 12, 66, 0.55)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.6)",
              }}
            />
            <span
              style={{
                display: "flex",
                whiteSpace: "nowrap",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                ...engraved,
              }}
            >
              Club
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
