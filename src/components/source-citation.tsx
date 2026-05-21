import { ExternalLink } from "lucide-react";

const BASE_PDF_URL = "https://cisce.org/wp-content/uploads/2026/01";

interface SourceCitationProps {
  pdfUrl: string;
  sourcePage: number;
  sourceExcerpt: string;
}

export function SourceCitation({ pdfUrl, sourcePage, sourceExcerpt }: SourceCitationProps) {
  // Build a direct PDF link with page anchor (works in most PDF viewers)
  const pageUrl = `${pdfUrl}#page=${sourcePage}`;
  const isKnownCisce = pdfUrl.startsWith(BASE_PDF_URL);

  return (
    <div className="mt-2 rounded-md border border-border bg-muted/40 p-3 text-xs">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-muted-foreground font-medium">Source — PDF page {sourcePage}</span>
        {isKnownCisce && (
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
            aria-label={`Open CISCE PDF at page ${sourcePage} (opens in new tab)`}
          >
            <ExternalLink className="h-3 w-3" aria-hidden />
            View PDF
          </a>
        )}
      </div>
      <blockquote className="text-muted-foreground italic leading-relaxed line-clamp-3">
        &ldquo;{sourceExcerpt}&rdquo;
      </blockquote>
    </div>
  );
}
