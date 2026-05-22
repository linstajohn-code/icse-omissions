import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-border/30 bg-background/20 backdrop-blur-xl supports-[backdrop-filter]:bg-background/10">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          {/* Editorial typographic lockup — no icon */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-foreground hover:text-primary transition-colors duration-300"
          >
            <span className="font-display text-lg font-light italic tracking-wide">
              ICSE
            </span>
            <span className="w-px h-4 bg-border/50" aria-hidden />
            <span className="text-xs font-light tracking-[0.2em] text-muted-foreground">
              Syllabus
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-light hidden sm:inline tracking-widest">
              2027–28
            </span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Site navigation">
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-widest uppercase text-muted-foreground/60 hover:text-foreground transition-all duration-300"
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
