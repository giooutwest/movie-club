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
            width: "82%",
            height: "82%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "999px",
            background:
              "linear-gradient(155deg, #ff6fb8 0%, #ff2f92 42%, #d4127a 100%)",
          }}
        >
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 2,
              color: "rgba(0,0,0,0.8)",
            }}
          >
            MOVIE
          </span>
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 2,
              color: "rgba(0,0,0,0.8)",
            }}
          >
            CLUB
          </span>
        </div>
      </div>
    ),
    size
  );
}
