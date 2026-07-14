import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
            width: "84%",
            height: "84%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "999px",
            background:
              "linear-gradient(155deg, #ff7ec0 0%, #ff2f92 45%, #c40f6f 100%)",
            boxShadow:
              "inset 0 6px 10px rgba(255,255,255,0.4), inset 0 -10px 16px rgba(0,0,0,0.35)",
          }}
        >
          <span
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              transform: "rotate(-13deg)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "rgba(120, 12, 66, 0.65)",
              textShadow:
                "1px 1px 0.5px rgba(255,255,255,0.75), -1px -1px 1px rgba(60,6,33,0.7)",
            }}
          >
            Movie Club
          </span>
        </div>
      </div>
    ),
    size
  );
}
