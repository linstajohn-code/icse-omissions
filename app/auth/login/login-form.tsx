"use client";

import { useActionState, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth-actions";

const initialState = { error: null as string | null };

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/class/9";

  const [state, formAction, isPending] = useActionState(signInWithEmail, initialState);
  const [submitted, setSubmitted] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showSuccess = submitted && !isPending && state.error === null;

  async function handleGoogle() {
    setGooglePending(true);
    try {
      await signInWithGoogle(next);
    } catch {
      // redirect() throws — that's expected
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 px-4">
      {/* Brand */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <BookOpen className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Bookmark topics and track your revision progress.
        </p>
      </div>

      {showSuccess ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
          <p className="font-medium">Check your email ✉️</p>
          <p className="text-sm text-muted-foreground">
            We sent a magic link. Click it to sign in — no password needed.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 text-xs text-primary underline"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <>
          {/* Email magic-link form */}
          <form
            ref={formRef}
            action={formAction}
            onSubmit={() => setSubmitted(true)}
            className="space-y-3"
          >
            <input type="hidden" name="next" value={next} />
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || googlePending}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Send magic link
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-2">or continue with</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            disabled={isPending || googlePending}
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googlePending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        By signing in you agree to our{" "}
        <Link href="/legal/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
