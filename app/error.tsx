"use client";

/**
 * Global error boundary — catches unhandled errors in the root layout tree.
 * Next.js requires this to be a Client Component that receives `error` + `reset`.
 */
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service here if needed
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4 px-4">
      <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden />
      <div>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          An unexpected error occurred. The syllabus data is unaffected — try
          refreshing or returning home.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
