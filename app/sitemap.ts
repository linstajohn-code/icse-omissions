import type { MetadataRoute } from "next";
import { SUBJECTS } from "@/lib/subjects";

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://icse-syllabus.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/class/9`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/class/10`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const subjectRoutes: MetadataRoute.Sitemap = SUBJECTS.flatMap((s) =>
    ([9, 10] as const).map((cls) => ({
      url: `${BASE}/class/${cls}/subject/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  return [...staticRoutes, ...subjectRoutes];
}
