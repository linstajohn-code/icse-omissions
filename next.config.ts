import type { NextConfig } from "next";

const config: NextConfig = {
  // Anchor file-tracing to the project root so Next.js ignores
  // the stray package-lock.json in the parent directory.
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Block MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy — don't leak full URL to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unused browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Basic CSP — allows Supabase auth domains; tighten after stable
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js inline scripts + Supabase auth popup
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: Tailwind inline styles + shadcn
              "style-src 'self' 'unsafe-inline'",
              // Supabase API + storage
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              // Images: self + data URIs (for avatars)
              "img-src 'self' data: https://*.supabase.co",
              // Fonts: self
              "font-src 'self'",
              // Supabase OAuth popup
              "frame-src 'self' https://accounts.google.com",
            ].join("; "),
          },
        ],
      },
      // No-cache for API routes (always fresh)
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default config;
