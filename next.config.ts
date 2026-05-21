import type { NextConfig } from "next";

const config: NextConfig = {
  // Serve the CISCE PDF source URL as an allowed image/external domain (for PDF preview links)
  // No image optimization needed for PDF links — they open externally
  experimental: {
    // App Router is stable in Next.js 15 — no flags needed
  },
};

export default config;
