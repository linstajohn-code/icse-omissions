import type { Metadata } from "next";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { searchEntries } from "@/lib/data";
import { chapterToSlug } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  description: "Search ICSE syllabus topics, chapters, and subjects.",
};

interface Props {
  searchParams: Promise<{ q?: string; class?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", class: cls } = await searchParams;
  const icseClass = cls === "9" ? 9 : cls === "10" ? 10 : undefined;
  const results = searchEntries(q, icseClass);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Search</h1>

      {/* Search form */}
      <form className="mb-8">
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search topics, chapters, subjects…"
              autoFocus
              className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              aria-label="Search query"
            />
          </div>
          <select
            name="class"
            defaultValue={cls ?? ""}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by class"
          >
            <option value="">All Classes</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {q.length >= 2 ? (
        results.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
              {icseClass ? ` in Class ${icseClass}` : ""}
            </p>
            <ol className="space-y-3">
              {results.map((entry, i) => (
                <li key={i}>
                  <Link
                    href={`/class/${entry.icseClass}/subject/${entry.subjectSlug}/${chapterToSlug(entry.chapter)}`}
                    className="block rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                      <span>Class {entry.icseClass}</span>
                      <ChevronRight className="h-3 w-3" aria-hidden />
                      <span>{entry.subjectName}</span>
                      <ChevronRight className="h-3 w-3" aria-hidden />
                      <span>{entry.chapter}</span>
                    </div>
                    <p className="font-medium text-card-foreground group-hover:text-primary transition-colors text-sm">
                      {entry.topic}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entry.source_excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No results for &ldquo;{q}&rdquo;.</p>
        )
      ) : (
        <p className="text-muted-foreground text-sm">Type at least 2 characters to search.</p>
      )}
    </div>
  );
}
