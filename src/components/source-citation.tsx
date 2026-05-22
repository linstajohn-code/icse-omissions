import { ExternalLink } from "lucide-react";

const BASE_PDF_URL = "https://cisce.org/wp-content/uploads/2026/01";

interface SourceCitationProps {
  pdfUrl: string;
  sourcePage: number;
  sourceExcerpt: string;
}

/**
 * SourceCitation — left-border citation in print typography style.
 *
 * Renders as a footnote reference rather than a UI callout box.
 * The left border conveys "cited source" — a convention from editorial design.
 */
export function SourceCitation({ pdfUrl, sourcePage, sourceExcerpt }: SourceCitationProps) {
  const pageUrl = `${pdfUrl}#page=${sourcePage}`;
  const isKnownCisce = pdfUrl.startsWith(BASE_PDF_URL);

  return (
    <div className="mt-3 pl-4 border-l border-border/40">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 font-light">
          Source · PDF p.{sourcePage}
        </span>
        {isKnownCisce && (
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary transition-colors tracking-wide font-light"
            aria-label={`Open CISCE PDF at page ${sourcePage} (opens in new tab)`}
          >
            <ExternalLink className="h-2.5 w-2.5" aria-hidden />
            View
          </a>
        )}
      </div>
      <blockquote className="text-xs text-muted-foreground/50 italic leading-relaxed line-clamp-3 font-light">
        &ldquo;{sourceExcerpt}&rdquo;
      </blockquote>
    </div>
  );
}
