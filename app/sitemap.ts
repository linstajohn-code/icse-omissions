import type { MetadataRoute } from "next";
import { SUBJECTS } from "@/lib/subjects";
import { listSubjectSummaries, getSubjectChapters } from "@/lib/data";

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://icse-syllabus.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/class/9`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/class/10`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const subjectRoutes: MetadataRoute.Sitemap = SUBJECTS.flatMap((s) =>
    ([9, 10] as const).map((cls) => ({
      url: `${BASE}/class/${cls}/subject/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  // All 366 chapter pages — same slug encoding as generateStaticParams
  const chapterRoutes: MetadataRoute.Sitemap = ([9, 10] as const).flatMap(
    (cls) =>
      listSubjectSummaries(cls).flatMap((s) => {
        const result = getSubjectChapters(cls, s.slug);
        if (!result) return [];
        return result.chapters.map((ch) => ({
          url: `${BASE}/class/${cls}/subject/${s.slug}/${encodeURIComponent(
            ch.name.replace(/\s+/g, "-")
          )}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
      })
  );

  return [...staticRoutes, ...subjectRoutes, ...chapterRoutes];
}
