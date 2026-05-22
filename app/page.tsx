/**
 * Homepage — delegates to HomeHero client component for cinematic animations.
 * Data is computed server-side and passed as serializable props.
 */
import { listSubjectSummaries } from "@/lib/data";
import { HomeHero } from "@/components/home-hero";

function computeStats(cls: 9 | 10) {
  const subjects = listSubjectSummaries(cls);
  return {
    subjects: subjects.length,
    topics: subjects.reduce((n, s) => n + s.entryCount, 0),
    omitted: subjects.reduce((n, s) => n + s.omittedCount, 0),
    partial: subjects.reduce((n, s) => n + s.partialCount, 0),
  };
}

export default function HomePage() {
  return <HomeHero stats9={computeStats(9)} stats10={computeStats(10)} />;
}
