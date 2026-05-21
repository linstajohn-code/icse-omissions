/**
 * Auto-generated OG image served at /opengraph-image.png.
 * Used by layout.tsx openGraph.images and twitter.images.
 * Runs on the Vercel Edge runtime — no Node APIs.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ICSE Syllabus 2027-28 — official CISCE omissions, every topic cited to the source PDF";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "72px 80px",
          gap: 0,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 64,
            height: 6,
            background: "#3b82f6",
            borderRadius: 3,
            marginBottom: 32,
          }}
        />
        {/* Title */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "#f8fafc",
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          ICSE Syllabus
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "#3b82f6",
            lineHeight: 1.1,
            letterSpacing: "-2px",
            marginBottom: 28,
          }}
        >
          2027-28
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: 700,
          }}
        >
          Class 9 &amp; 10 omissions — every topic cited to the official CISCE PDF
        </div>
        {/* Badge */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 16,
          }}
        >
          {["873 topics", "34 subjects", "Session 2027-28"].map((label) => (
            <div
              key={label}
              style={{
                background: "#1e293b",
                color: "#cbd5e1",
                fontSize: 18,
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid #334155",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
