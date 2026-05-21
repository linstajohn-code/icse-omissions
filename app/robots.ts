import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://icse-syllabus.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/", "/account"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
