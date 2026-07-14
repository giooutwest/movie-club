import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
            display: "flex",
            width: 760,
            height: 300,
            borderRadius: 150,
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(155deg, #ffc7e0 0%, #f78bbd 45%, #dd5695 100%)",
          }}
        >
          <span
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: 4,
              color: "#000000",
            }}
          >
            MOVIE CLUB
          </span>
        </div>
      </div>
    ),
    size
  );
}
