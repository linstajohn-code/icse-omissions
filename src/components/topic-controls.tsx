"use client";

/**
 * Per-topic bookmark + progress + notes controls.
 *
 * Uses a "topic key" ({class}/{subjectSlug}/{chapterOrder}/{topicOrder})
 * that the server resolves to a Supabase UUID — so this component works
 * without knowing Supabase internals.
 *
 * Gracefully renders nothing when:
 * - no user is signed in (API returns empty data, not an error)
 * - Supabase is not configured (API returns 404/500)
 *
 * Notes auto-save 1.5 s after the user stops typing.
 */
import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import { Bookmark, CheckCircle, Circle, Clock, PenLine } from "lucide-react";
import type { ProgressStatus } from "@/types/database";

interface TopicControlsProps {
  /** "{class}/{subjectSlug}/{chapterOrder}/{topicOrder}" — e.g. "9/mathematics/1/3" */
  topicKey: string;
}

type LocalState = {
  bookmarked: boolean;
  progress: ProgressStatus;
  notesMd: string;
  notesOpen: boolean;
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
    notesMd: "",
    notesOpen: false,
  });
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all three on mount
  useEffect(() => {
    void (async () => {
      try {
        const encoded = encodeURIComponent(topicKey);
        const [bRes, pRes, nRes] = await Promise.all([
          fetch(`/api/bookmarks?keys=${encoded}`),
          fetch(`/api/progress?keys=${encoded}`),
          fetch(`/api/notes?keys=${encoded}`),
        ]);
        if (!bRes.ok || !pRes.ok || !nRes.ok) return;
        const { bookmarked } = (await bRes.json()) as { bookmarked: string[] };
        const { progress } = (await pRes.json()) as {
          progress: Record<string, ProgressStatus>;
        };
        const { notes } = (await nRes.json()) as { notes: Record<string, string> };
        if (bookmarked === undefined && progress === undefined) return;
        setState({
          bookmarked: bookmarked.includes(topicKey),
          progress: progress[topicKey] ?? "not_started",
          notesMd: notes[topicKey] ?? "",
          notesOpen: false,
        });
        setVisible(true);
      } catch {
        // Supabase not configured or network error — stay hidden
      }
    })();
  }, [topicKey]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

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

  const handleNotesChange = useCallback(
    (value: string) => {
      setState((s) => ({ ...s, notesMd: value }));
      // Debounced auto-save — 1.5 s after last keystroke
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: topicKey, notes_md: value }),
        });
      }, 1500);
    },
    [topicKey]
  );

  const toggleNotes = useCallback(() => {
    setState((s) => ({ ...s, notesOpen: !s.notesOpen }));
  }, []);

  if (!visible) return null;

  const hasNote = state.notesMd.trim().length > 0;

  return (
    <div className="mt-2 space-y-2">
      {/* Controls row */}
      <div
        className="flex items-center gap-2 flex-wrap"
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

        {/* Notes toggle */}
        <button
          type="button"
          onClick={toggleNotes}
          aria-pressed={state.notesOpen}
          aria-label={hasNote ? "Edit note" : "Add note"}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors border ${
            hasNote || state.notesOpen
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <PenLine className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">{hasNote ? "Note" : "Add note"}</span>
          {hasNote && !state.notesOpen && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary ml-0.5" aria-hidden />
          )}
        </button>
      </div>

      {/* Inline notes textarea */}
      {state.notesOpen && (
        <div className="ml-0">
          <textarea
            value={state.notesMd}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add your study notes here… (Markdown supported, auto-saves)"
            rows={3}
            aria-label="Study note for this topic"
            className="w-full text-xs rounded-md border bg-muted/30 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-muted-foreground/60"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Auto-saves · Markdown supported
          </p>
        </div>
      )}
    </div>
  );
}
