import type { Metadata } from "next";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { searchEntries } from "@/lib/data";
import { chapterToSlug } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { OmissionStatus } from "@/types/ingest";

export const metadata: Metadata = {
  title: "Search",
  description: "Search ICSE syllabus topics, chapters, and subjects.",
};

interface Props {
  searchParams: Promise<{ q?: string; class?: string; status?: string }>;
}

const STATUS_LABEL: Record<OmissionStatus, string> = {
  included: "Included",
  omitted: "Omitted",
  partial: "Partial",
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", class: cls, status: statusFilter } = await searchParams;
  const icseClass = cls === "9" ? 9 : cls === "10" ? 10 : undefined;

  let results = searchEntries(q, icseClass);

  // Status filter
  if (statusFilter === "omitted") {
    results = results.filter((e) => e.status === "omitted" || e.status === "partial");
  }

  const omittedResultCount = results.filter(
    (e) => e.status === "omitted" || e.status === "partial"
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Search</h1>

      {/* Search form */}
      <form className="mb-6">
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden
            />
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

        {/* Status filter chips */}
        {q.length >= 2 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap" role="group" aria-label="Filter by status">
            <span className="text-xs text-muted-foreground">Show:</span>
            <Link
              href={`/search?q=${encodeURIComponent(q)}${cls ? `&class=${cls}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                !statusFilter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              aria-current={!statusFilter ? "true" : undefined}
            >
              All results ({searchEntries(q, icseClass).length})
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(q)}${cls ? `&class=${cls}` : ""}&status=omitted`}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                statusFilter === "omitted"
                  ? "bg-destructive text-destructive-foreground border-destructive"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              aria-current={statusFilter === "omitted" ? "true" : undefined}
            >
              Omitted / Partial ({omittedResultCount})
            </Link>
          </div>
        )}
      </form>

      {/* Results */}
      {q.length >= 2 ? (
        results.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
              &ldquo;{q}&rdquo;
              {icseClass ? ` in Class ${icseClass}` : ""}
              {statusFilter === "omitted" ? " · omitted/partial only" : ""}
            </p>
            <ol className="space-y-3" role="list">
              {results.map((entry, i) => {
                const status = entry.status as OmissionStatus;
                const isRemoved = status === "omitted" || status === "partial";
                return (
                  <li key={i}>
                    <Link
                      href={`/class/${entry.icseClass}/subject/${entry.subjectSlug}/${chapterToSlug(entry.chapter)}#topic-${entry.topic_order}`}
                      className={`block rounded-lg border p-4 hover:shadow-sm transition-all group ${
                        isRemoved
                          ? "border-dashed hover:border-red-400/60 dark:hover:border-red-700/60"
                          : "border-border hover:border-primary/40"
                      } bg-card`}
                    >
                      {/* Breadcrumb trail */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5 flex-wrap">
                        <span>Class {entry.icseClass}</span>
                        <ChevronRight className="h-3 w-3" aria-hidden />
                        <span>{entry.subjectName}</span>
                        <ChevronRight className="h-3 w-3" aria-hidden />
                        <span>{entry.chapter}</span>
                      </div>

                      {/* Topic name + badge */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p
                          className={`font-medium text-sm leading-snug group-hover:text-primary transition-colors ${
                            status === "omitted"
                              ? "line-through text-muted-foreground"
                              : "text-card-foreground"
                          }`}
                        >
                          {entry.topic}
                        </p>
                        <Badge variant={status} aria-label={`Status: ${STATUS_LABEL[status]}`}>
                          {STATUS_LABEL[status]}
                        </Badge>
                      </div>

                      {/* Source excerpt */}
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {entry.source_excerpt}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No results for &ldquo;{q}&rdquo;
            {statusFilter === "omitted" ? " with omitted/partial status" : ""}.
          </p>
        )
      ) : (
        <p className="text-muted-foreground text-sm">
          Type at least 2 characters to search.
        </p>
      )}
    </div>
  );
}
