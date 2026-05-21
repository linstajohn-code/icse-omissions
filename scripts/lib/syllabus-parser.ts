import type { OmissionEntry, PdfPage, ParseReport } from "../../src/types/ingest.js";

/**
 * ICSE syllabus document structure (consistent across all Year 2028 subjects):
 *
 * [preamble / aims]
 * CLASS IX
 * <exam structure line>
 * N.  Chapter Name
 *   (i) / (a) / bullet-point topics
 *   ...
 * N+1.  Chapter Name
 *   ...
 * CLASS X
 *   [same structure]
 *
 * Strategy:
 * 1. Find CLASS IX and CLASS X boundaries.
 * 2. Within each section, find numbered chapters: /^\s*(\d+)\.\s+([A-Z][^.]+)$/
 * 3. For each chapter, extract named sub-topics:
 *    - Roman-numeral items: /(i+|iv|v|vi+|ix|x)\)/
 *    - Letter items: /\(([a-z])\)/
 *    - Named headings: lines that are a short Capitalized phrase on their own
 * 4. Anything that can't be classified is flagged in ParseReport.unparsedSections.
 */

interface Chapter {
  order: number;
  name: string;
  pageNum: number;
  excerpt: string;
  rawContent: string;
}

interface Topic {
  order: number;
  name: string;
  pageNum: number;
  excerpt: string;
}

// Chapters whose names contain these words are actually aims/preamble, not syllabus chapters.
const AIMS_PATTERNS = [
  /^to\s+/i,
  /^develop\s+/i,
  /^acquire\s+/i,
  /^understand\s+/i,
];

function isAimsItem(name: string): boolean {
  return AIMS_PATTERNS.some((p) => p.test(name.trim()));
}

/** Combine pages into a single string, tracking which chars belong to which page. */
function buildPageMap(
  pages: PdfPage[]
): { fullText: string; pageAtOffset: (offset: number) => number } {
  let fullText = "";
  const boundaries: { start: number; pageNum: number }[] = [];

  for (const p of pages) {
    boundaries.push({ start: fullText.length, pageNum: p.pageNum });
    fullText += "\n" + p.text + "\n";
  }

  function pageAtOffset(offset: number): number {
    let page = boundaries[0]?.pageNum ?? 1;
    for (const b of boundaries) {
      if (b.start <= offset) page = b.pageNum;
      else break;
    }
    return page;
  }

  return { fullText, pageAtOffset };
}

/** Find the character index of CLASS IX / CLASS X markers in the full text. */
function findClassBoundaries(text: string): {
  ixStart: number | null;
  xStart: number | null;
  /** Positions of "INTERNAL ASSESSMENT" headers, one per class section end */
  internalAssessmentStarts: number[];
} {
  // Match CLASS IX strictly, or CLASSES IX (e.g. "CLASSES IX & X", "Classes IX and X")
  const ixMatch = text.match(/\nCLASS(?:ES)?\s+IX\b/i);
  // Match CLASS X strictly (not "CLASS IX") — requires \bX followed by non-digit
  const xMatch = text.match(/\nCLASS\s+X\b(?!\s+&|\s+and\b)/i);

  // Collect all INTERNAL ASSESSMENT section starts (each class ends with one)
  const iaStarts: number[] = [];
  const iaRe = /\nINTERNAL ASSESSMENT/g;
  let m: RegExpExecArray | null;
  while ((m = iaRe.exec(text)) !== null) {
    iaStarts.push(m.index);
  }

  return {
    ixStart: ixMatch?.index ?? null,
    xStart: xMatch?.index ?? null,
    internalAssessmentStarts: iaStarts,
  };
}

/** First INTERNAL ASSESSMENT position that comes after `start`. */
function findSectionEnd(
  iaStarts: number[],
  start: number,
  documentEnd: number
): number {
  for (const pos of iaStarts) {
    if (pos > start) return pos;
  }
  return documentEnd;
}

/** Extract chapters from one class section's text slice. */
function extractChapters(
  sectionText: string,
  globalOffset: number,
  pageAtOffset: (offset: number) => number
): Chapter[] {
  const chapterRegex = /^\s*(\d+)\.\s{1,4}([A-Z][^\n]{1,80})\n/gm;
  const matches: { order: number; name: string; matchIndex: number; end: number }[] = [];

  let m: RegExpExecArray | null;
  while ((m = chapterRegex.exec(sectionText)) !== null) {
    const name = m[2]!.trim();
    if (!isAimsItem(name) && name.length > 2) {
      matches.push({
        order: parseInt(m[1]!, 10),
        name,
        matchIndex: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  const chapters: Chapter[] = [];
  for (let i = 0; i < matches.length; i++) {
    const curr = matches[i]!;
    const nextStart = matches[i + 1]?.matchIndex ?? sectionText.length;
    const rawContent = sectionText.slice(curr.end, nextStart);
    const excerpt = buildExcerpt(curr.name + "\n" + rawContent);
    const pageNum = pageAtOffset(globalOffset + curr.matchIndex);

    chapters.push({
      order: curr.order,
      name: curr.name,
      pageNum,
      excerpt,
      rawContent,
    });
  }

  return chapters;
}

/** Extract sub-topics from a chapter's raw content. */
function extractTopics(
  chapter: Chapter,
  globalOffset: number,
  chapterOffset: number,
  pageAtOffset: (offset: number) => number
): Topic[] {
  const text = chapter.rawContent;
  const topics: Topic[] = [];

  // Pattern 1: Roman numeral items — (i), (ii), (iii), (iv) ... (xi), (xii)
  const romanRegex =
    /\(\s*(i{1,3}|iv|vi{0,3}|ix|xi{0,2}|xii)\s*\)\s+([^\n]{3,120})/gi;
  // Pattern 2: Letter items — (a), (b) ... (z)
  const letterRegex = /\(\s*([a-d])\s*\)\s+([^\n]{3,120})/g;
  // Pattern 3: Named section headings — a line that is a short title (Title Case or ALL CAPS)
  // at least 4 chars, not starting with lowercase, not a sentence
  const namedHeadingRegex = /^([A-Z][A-Za-z\s&,/\-()]{3,80})\s*\n/gm;

  const candidates: { offset: number; name: string }[] = [];

  // Collect roman numeral sub-topics
  let m: RegExpExecArray | null;
  const seenRoman = new Set<string>();
  while ((m = romanRegex.exec(text)) !== null) {
    const label = `(${m[1]!.toLowerCase()})`;
    if (!seenRoman.has(label)) {
      seenRoman.add(label);
      candidates.push({ offset: m.index, name: `${label} ${m[2]!.trim()}` });
    }
  }

  // If no roman numerals found, try letter sub-topics
  if (candidates.length === 0) {
    while ((m = letterRegex.exec(text)) !== null) {
      candidates.push({ offset: m.index, name: `(${m[1]!}) ${m[2]!.trim()}` });
    }
  }

  // If still nothing, try named headings (e.g. "Rational and Irrational Numbers")
  if (candidates.length === 0) {
    const seen = new Set<string>();
    while ((m = namedHeadingRegex.exec(text)) !== null) {
      const heading = m[1]!.trim();
      if (
        heading.length >= 4 &&
        !isAimsItem(heading) &&
        !/^Note/i.test(heading) &&
        !/^There will/i.test(heading) &&
        !seen.has(heading)
      ) {
        seen.add(heading);
        candidates.push({ offset: m.index, name: heading });
      }
    }
  }

  // If we found nothing at all, create a single synthetic topic = the chapter name
  if (candidates.length === 0) {
    topics.push({
      order: 1,
      name: chapter.name,
      pageNum: chapter.pageNum,
      excerpt: buildExcerpt(text) || buildExcerpt(chapter.name),
    });
    return topics;
  }

  // Build topics from candidates, truncating names sensibly
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]!;
    const name = c.name.replace(/\s+/g, " ").slice(0, 120);
    const pageNum = pageAtOffset(globalOffset + chapterOffset + c.offset);
    const nextOffset = candidates[i + 1]?.offset ?? text.length;
    const topicText = text.slice(c.offset, nextOffset);
    const excerpt = buildExcerpt(topicText) || buildExcerpt(name);
    topics.push({
      order: i + 1,
      name: cleanTopicName(name),
      pageNum,
      excerpt,
    });
  }

  return topics;
}

function cleanTopicName(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/^\([ivxab]+\)\s+/i, (m) => m.trim() + " ") // normalise "(i) Foo" → "(i) Foo"
    .trim()
    .slice(0, 200);
}

function buildExcerpt(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 500);
}

/**
 * Main parsing entry point. Returns OmissionEntry[] for one class (IX or X),
 * plus any unparsed section reports.
 */
export function parseClassSection(
  pages: PdfPage[],
  icseClass: 9 | 10,
  effectiveSession: string
): { entries: OmissionEntry[]; report: Partial<ParseReport> } {
  const { fullText, pageAtOffset } = buildPageMap(pages);
  const { ixStart, xStart, internalAssessmentStarts } = findClassBoundaries(fullText);

  let sectionText: string;
  let sectionOffset: number;

  if (icseClass === 9) {
    if (ixStart === null) {
      return {
        entries: [],
        report: {
          warnings: ["CLASS IX section not found in document"],
          unparsedSections: [
            {
              pageNum: pages[0]?.pageNum ?? 1,
              reason: "CLASS IX section not found",
              rawExcerpt: fullText.slice(0, 300),
            },
          ],
        },
      };
    }
    // End at CLASS X or first INTERNAL ASSESSMENT after CLASS IX, whichever comes first
    const iaEnd = findSectionEnd(internalAssessmentStarts, ixStart, fullText.length);
    const end = Math.min(xStart ?? fullText.length, iaEnd);
    sectionText = fullText.slice(ixStart, end);
    sectionOffset = ixStart;
  } else {
    if (xStart === null) {
      return {
        entries: [],
        report: {
          warnings: ["CLASS X section not found in document"],
          unparsedSections: [
            {
              pageNum: pages[0]?.pageNum ?? 1,
              reason: "CLASS X section not found",
              rawExcerpt: fullText.slice(0, 300),
            },
          ],
        },
      };
    }
    // End at INTERNAL ASSESSMENT after CLASS X
    const end = findSectionEnd(internalAssessmentStarts, xStart, fullText.length);
    sectionText = fullText.slice(xStart, end);
    sectionOffset = xStart;
  }

  const chapters = extractChapters(sectionText, sectionOffset, pageAtOffset);
  const entries: OmissionEntry[] = [];
  const unparsedSections: { pageNum: number; reason: string; rawExcerpt: string }[] = [];

  if (chapters.length === 0) {
    unparsedSections.push({
      pageNum: pageAtOffset(sectionOffset),
      reason: "No chapters found in section — check heading format",
      rawExcerpt: buildExcerpt(sectionText),
    });
  }

  for (const ch of chapters) {
    const chOffset = sectionText.indexOf(ch.rawContent);
    const topics = extractTopics(ch, sectionOffset, chOffset, pageAtOffset);

    if (topics.length === 0) {
      unparsedSections.push({
        pageNum: ch.pageNum,
        reason: `Chapter "${ch.name}" yielded no topics`,
        rawExcerpt: buildExcerpt(ch.rawContent),
      });
    }

    for (const t of topics) {
      entries.push({
        chapter: ch.name,
        chapter_order: ch.order,
        topic: t.name,
        topic_order: t.order,
        status: "included",
        source_page: t.pageNum,
        source_excerpt: t.excerpt,
        effective_session: effectiveSession,
      });
    }
  }

  return {
    entries,
    report: {
      chaptersFound: chapters.length,
      topicsFound: entries.length,
      unparsedSections,
      warnings: [],
    },
  };
}
