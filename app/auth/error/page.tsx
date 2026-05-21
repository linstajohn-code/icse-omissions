import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Auth error" };

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="max-w-sm w-full px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign-in failed</h1>
        <p className="text-muted-foreground text-sm">
          The link may have expired or already been used. Please try again.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
