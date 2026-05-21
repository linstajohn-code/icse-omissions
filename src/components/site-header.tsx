import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
        >
          <BookOpen className="h-5 w-5" aria-hidden />
          <span>ICSE Syllabus</span>
          <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
            2027-28
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Site navigation">
          <Link
            href="/search"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <ThemeToggle />
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
