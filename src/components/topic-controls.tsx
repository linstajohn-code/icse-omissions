"use client";

/**
 * Per-topic bookmark + progress controls.
 *
 * Uses a "topic key" ({class}/{subjectSlug}/{chapterOrder}/{topicOrder})
 * that the server resolves to a Supabase UUID — so this component works
 * without knowing Supabase internals.
 *
 * Gracefully renders nothing when:
 * - no user is signed in (API returns empty data, not an error)
 * - Supabase is not configured (API returns 404/500)
 */
import { useEffect, useState, useCallback, useTransition } from "react";
import { Bookmark, CheckCircle, Circle, Clock } from "lucide-react";
import type { ProgressStatus } from "@/types/database";

interface TopicControlsProps {
  /** "{class}/{subjectSlug}/{chapterOrder}/{topicOrder}" — e.g. "9/mathematics/1/3" */
  topicKey: string;
}

type LocalState = {
  bookmarked: boolean;
  progress: ProgressStatus;
};

const PROGRESS_OPTIONS: {
  value: ProgressStatus;
  label: string;
  Icon: React.ElementType;
}[] = [
  { value: "not_started", label: "Not started", Icon: Circle },
  { value: "in_progress", label: "In progress", Icon: Clock },
  { value: "revised", label: "Revised", Icon: CheckCircle },
];

export function TopicControls({ topicKey }: TopicControlsProps) {
  const [state, setState] = useState<LocalState>({
    bookmarked: false,
    progress: "not_started",
  });
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    void (async () => {
      try {
        const encoded = encodeURIComponent(topicKey);
        const [bRes, pRes] = await Promise.all([
          fetch(`/api/bookmarks?keys=${encoded}`),
          fetch(`/api/progress?keys=${encoded}`),
        ]);
        if (!bRes.ok || !pRes.ok) return;
        const { bookmarked } = (await bRes.json()) as { bookmarked: string[] };
        const { progress } = (await pRes.json()) as {
          progress: Record<string, ProgressStatus>;
        };
        // Only show controls if the API succeeded (user is logged in + Supabase configured)
        // An empty array/object means logged-out, which also means don't show
        if (bookmarked === undefined && progress === undefined) return;
        setState({
          bookmarked: bookmarked.includes(topicKey),
          progress: progress[topicKey] ?? "not_started",
        });
        setVisible(true);
      } catch {
        // Supabase not configured or network error — stay hidden
      }
    })();
  }, [topicKey]);

  const toggleBookmark = useCallback(() => {
    const next = !state.bookmarked;
    setState((s) => ({ ...s, bookmarked: next }));
    startTransition(() => {
      void fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: topicKey, bookmarked: next }),
      });
    });
  }, [state.bookmarked, topicKey]);

  const setProgress = useCallback(
    (status: ProgressStatus) => {
      setState((s) => ({ ...s, progress: status }));
      startTransition(() => {
        void fetch("/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: topicKey, status }),
        });
      });
    },
    [topicKey]
  );

  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-2 mt-2 flex-wrap"
      role="group"
      aria-label="Topic actions"
    >
      {/* Bookmark toggle */}
      <button
        type="button"
        onClick={toggleBookmark}
        aria-pressed={state.bookmarked}
        aria-label={state.bookmarked ? "Remove bookmark" : "Bookmark this topic"}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors border ${
          state.bookmarked
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <Bookmark
          className="h-3.5 w-3.5"
          fill={state.bookmarked ? "currentColor" : "none"}
          aria-hidden
        />
        {state.bookmarked ? "Bookmarked" : "Bookmark"}
      </button>

      {/* Progress radio group */}
      <div
        role="radiogroup"
        aria-label="Revision progress"
        className="flex items-center gap-1"
      >
        {PROGRESS_OPTIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={state.progress === value}
            aria-label={label}
            onClick={() => setProgress(value)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors border ${
              state.progress === value
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
