import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ICSE Syllabus 2027-28",
    short_name: "ICSE Syllabus",
    description:
      "Official CISCE omissions for Class 9 & 10 — every topic cited to the source PDF.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
