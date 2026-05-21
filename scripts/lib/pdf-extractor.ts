import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { PdfPage } from "../../src/types/ingest.js";

/**
 * Extracts text content page-by-page from a PDF using pdfjs-dist.
 * Returns pages in order with 1-based page numbers.
 * Strips CISCE page footers ("ICSE Examination Year NNNN") and bare page numbers.
 */
export async function extractPages(pdfPath: string): Promise<{
  pages: PdfPage[];
  sha256: string;
  numPages: number;
}> {
  const buffer = fs.readFileSync(path.resolve(pdfPath));
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  // pdfjs-dist legacy build for Node.js (no DOM, no worker)
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // In Node.js we resolve the worker path from node_modules; no DOM worker is needed.
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const workerPath = require.resolve(
    "pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath}`;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: PdfPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Use hasEOL to reconstruct line breaks; str values already include word spacing.
    const rawText = content.items
      .map((item) => {
        if ("str" in item) {
          return item.str + ((item as { hasEOL?: boolean }).hasEOL ? "\n" : "");
        }
        return "";
      })
      .join("");

    const text = cleanPageText(rawText);
    if (text.trim().length > 0) {
      pages.push({ pageNum: i, text });
    }
  }

  return { pages, sha256, numPages };
}

/** Strip CISCE headers/footers that appear on every page. */
function cleanPageText(raw: string): string {
  return raw
    .replace(/ICSE\s+Examination\s+Year\s+\d{4}\s*/gi, "")
    .replace(/ICSE\s+Exam\s+Year\s+\d{4}\s*/gi, "")
    .replace(/^\s*\d+\s*$/gm, "")   // bare page numbers on their own line
    // CISCE footer page number appended directly to last content (no preceding newline).
    // Pattern: letter/punctuation immediately followed by 1-3 digits at end of text.
    // Matches "formula.4" → "formula." but not "H2SO4" mid-sentence (safe for chemistry
    // topics because the digit follows a letter, not another digit).
    .replace(/(?<=[a-zA-Z.,;:)])(\d{1,3})\s*$/, "")
    .replace(/\x0c/g, "\n")          // form feeds → newlines
    .replace(/[ \t]{2,}/g, " ")      // collapse multiple spaces
    .trim();
}
