import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { PdfPage } from "../../src/types/ingest.js";
import { parseClassSection } from "../lib/syllabus-parser.js";

function loadFixture(name: string): string {
  return fs.readFileSync(
    path.join(__dirname, "fixtures", name),
    "utf-8"
  );
}

function textToPages(text: string, startPage = 1): PdfPage[] {
  // Split on form feed if present, otherwise treat as one page
  const rawPages = text.split(/\x0c/);
  return rawPages.map((t, i) => ({ pageNum: startPage + i, text: t }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Mathematics — Class IX
// ─────────────────────────────────────────────────────────────────────────────
describe("Mathematics Class IX parser", () => {
  const text = loadFixture("math-full.txt");
  const pages = textToPages(text);

  it("finds at least 6 chapters in CLASS IX", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const chapters = [...new Set(entries.map((e) => e.chapter))];
    expect(chapters.length).toBeGreaterThanOrEqual(6);
  });

  it("includes 'Pure Arithmetic' as a chapter", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const chapters = entries.map((e) => e.chapter);
    expect(chapters).toContain("Pure Arithmetic");
  });

  it("includes 'Algebra' as a chapter", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const chapters = entries.map((e) => e.chapter);
    expect(chapters).toContain("Algebra");
  });

  it("all entries have status 'included'", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    expect(entries.every((e) => e.status === "included")).toBe(true);
  });

  it("all entries have source_page >= 1", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    expect(entries.every((e) => e.source_page >= 1)).toBe(true);
  });

  it("all entries have non-empty source_excerpt", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    expect(entries.every((e) => e.source_excerpt.length > 0)).toBe(true);
  });

  it("all entries carry the correct effective_session", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    expect(entries.every((e) => e.effective_session === "2027-28")).toBe(true);
  });

  it("chapter_order is monotonically increasing within a chapter group", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const orders = [...new Set(entries.map((e) => e.chapter_order))].sort(
      (a, b) => a - b
    );
    expect(orders[0]).toBe(1);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]! - orders[i - 1]!).toBeLessThanOrEqual(2); // allow gaps CISCE sometimes uses
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mathematics — Class X
// ─────────────────────────────────────────────────────────────────────────────
describe("Mathematics Class X parser", () => {
  const text = loadFixture("math-full.txt");
  const pages = textToPages(text);

  it("finds at least 5 chapters in CLASS X", () => {
    const { entries } = parseClassSection(pages, 10, "2027-28");
    const chapters = [...new Set(entries.map((e) => e.chapter))];
    expect(chapters.length).toBeGreaterThanOrEqual(5);
  });

  it("includes 'Algebra' in CLASS X", () => {
    const { entries } = parseClassSection(pages, 10, "2027-28");
    const chapters = entries.map((e) => e.chapter);
    expect(chapters).toContain("Algebra");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Physics — Class IX (roman-numeral sub-topic style)
// ─────────────────────────────────────────────────────────────────────────────
describe("Physics Class IX parser", () => {
  const text = loadFixture("physics-sample.txt");
  const pages = textToPages(text);

  it("finds at least 1 chapter", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const chapters = [...new Set(entries.map((e) => e.chapter))];
    expect(chapters.length).toBeGreaterThanOrEqual(1);
  });

  it("finds 'Measurements and Experimentation' chapter", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const chapters = entries.map((e) => e.chapter);
    expect(chapters).toContain("Measurements and Experimentation");
  });

  it("all entries have non-empty topic names", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    expect(entries.every((e) => e.topic.trim().length > 0)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// History & Civics — Class IX (named heading sub-topic style)
// ─────────────────────────────────────────────────────────────────────────────
describe("History & Civics Class IX parser", () => {
  const text = loadFixture("history-civics-sample.txt");
  const pages = textToPages(text);

  it("finds at least 1 chapter", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const chapters = [...new Set(entries.map((e) => e.chapter))];
    expect(chapters.length).toBeGreaterThanOrEqual(1);
  });

  it("no entry has an empty source_excerpt", () => {
    const { entries } = parseClassSection(pages, 9, "2027-28");
    expect(entries.every((e) => e.source_excerpt.length > 5)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe("Edge cases", () => {
  it("returns empty entries and a warning when CLASS IX is missing", () => {
    const pages: PdfPage[] = [{ pageNum: 1, text: "Some random text\nCLASS X\n1. Algebra\n(i) Linear equations\n" }];
    const { entries, report } = parseClassSection(pages, 9, "2027-28");
    expect(entries).toHaveLength(0);
    expect(report.warnings?.length).toBeGreaterThan(0);
  });

  it("returns empty entries and a warning when CLASS X is missing", () => {
    const pages: PdfPage[] = [{ pageNum: 1, text: "CLASS IX\n1. Algebra\n(i) Linear equations\n" }];
    const { entries, report } = parseClassSection(pages, 10, "2027-28");
    expect(entries).toHaveLength(0);
    expect(report.warnings?.length).toBeGreaterThan(0);
  });

  it("does not include aims items (To acquire...) as chapters", () => {
    const text = [
      "CLASS IX",
      "1.  To acquire knowledge and understanding",
      "2.  To develop skills",
      "1.  Algebra",
      "(i) Linear equations and inequalities",
      "2.  Geometry",
      "(i) Triangles and their properties",
    ].join("\n");
    const pages = [{ pageNum: 1, text }];
    const { entries } = parseClassSection(pages, 9, "2027-28");
    const chapters = [...new Set(entries.map((e) => e.chapter))];
    expect(chapters).not.toContain("To acquire knowledge and understanding");
    expect(chapters).toContain("Algebra");
  });
});
