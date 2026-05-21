#!/usr/bin/env node
/**
 * pnpm ingest:cisce -- --pdf=<path> [--subject=<name>] [--class=9|10] [--session=2027-28]
 *
 * Parses an ICSE Year 2028 subject syllabus PDF and outputs:
 *   - /data/omissions/<class>/<subject>.json
 *   - appends to ingest-report.md
 *
 * SOURCE OF TRUTH: official CISCE regulations PDFs published at cisce.org.
 * Every entry in the JSON carries source_page + source_excerpt so every
 * topic (included or omitted) is citable.
 */

import { Command } from "commander";
import path from "node:path";
import type { SubjectOmissionsFile, ParseReport } from "../src/types/ingest.js";
import { extractPages } from "./lib/pdf-extractor.js";
import { parseClassSection } from "./lib/syllabus-parser.js";
import { writeSubjectJson } from "./lib/json-writer.js";
import { validateSubjectFile } from "./lib/schema-validator.js";
import { appendToReport, ensureReportExists } from "./lib/report-writer.js";

// Known ICSE Year 2028 subject metadata keyed by the PDF filename stem.
// Subject code is from the CISCE document header e.g. "Mathematics (51)".
const KNOWN_SUBJECTS: Record<
  string,
  { name: string; code: string; slug: string }
> = {
  "2.-English":               { name: "English",                code: "01", slug: "english" },
  "3.-Second-Languages":      { name: "Second Languages",       code: "various", slug: "second-languages" },
  "5.-History-Civics":        { name: "History and Civics",     code: "50", slug: "history-and-civics" },
  "6.-Geography":             { name: "Geography",              code: "50", slug: "geography" },
  "9.-Mathematics":           { name: "Mathematics",            code: "51", slug: "mathematics" },
  "10.-Physics":              { name: "Physics",                code: "52", slug: "physics" },
  "11.-Chemistry":            { name: "Chemistry",              code: "52", slug: "chemistry" },
  "12.-Biology":              { name: "Biology",                code: "52", slug: "biology" },
  "13.-Economics":            { name: "Economics",              code: "53", slug: "economics" },
  "14.-Commercial-Studies":   { name: "Commercial Studies",     code: "58", slug: "commercial-studies" },
  "17.-Environmental-Science":{ name: "Environmental Science",  code: "82", slug: "environmental-science" },
  "18.-Computer-Applications":{ name: "Computer Applications",  code: "86", slug: "computer-applications" },
  "19.-Economic-Applications":{ name: "Economic Applications",  code: "87", slug: "economic-applications" },
  "20.-Commercial-Applications":{ name: "Commercial Applications", code: "88", slug: "commercial-applications" },
  "22.-Performing-Arts":      { name: "Performing Arts",        code: "91", slug: "performing-arts" },
  "26.-Physical-Education":   { name: "Physical Education",     code: "72", slug: "physical-education" },
  "27.-Yoga":                 { name: "Yoga",                   code: "84", slug: "yoga" },
};

const BASE_URL = "https://cisce.org/wp-content/uploads/2026/01";

const program = new Command();
program
  .name("ingest-cisce")
  .description("Parse an ICSE CISCE subject syllabus PDF into structured JSON")
  .requiredOption("--pdf <path>", "Path to the PDF file")
  .option("--subject <name>", "Subject name override (auto-detected from filename if omitted)")
  .option("--class <number>", "ICSE class (9 or 10). If omitted, both are processed.", "both")
  .option("--session <session>", "Academic session e.g. 2027-28", "2027-28")
  .option("--exam-year <year>", "Exam year", "2028")
  .parse(process.argv);

const opts = program.opts<{
  pdf: string;
  subject?: string;
  class: string;
  session: string;
  examYear: string;
}>();

async function main() {
  ensureReportExists();

  const pdfPath = path.resolve(opts.pdf);
  const stem = path.basename(pdfPath, ".pdf");
  const meta = KNOWN_SUBJECTS[stem];

  const subjectName = opts.subject ?? meta?.name ?? stem;
  const subjectCode = meta?.code ?? "??";
  const subjectSlug = meta?.slug ?? stem.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const examYear = parseInt(opts.examYear, 10);
  const effectiveSession = opts.session;

  console.log(`\n[ingest:cisce] ${subjectName} — Year ${examYear} — session ${effectiveSession}`);
  console.log(`  PDF: ${pdfPath}`);

  const { pages, sha256, numPages } = await extractPages(pdfPath);
  console.log(`  Pages extracted: ${numPages}`);

  const classes: (9 | 10)[] =
    opts.class === "both" ? [9, 10] : [parseInt(opts.class, 10) as 9 | 10];

  for (const icseClass of classes) {
    console.log(`  Processing CLASS ${icseClass}...`);

    const { entries, report: partialReport } = parseClassSection(
      pages,
      icseClass,
      effectiveSession
    );

    const report: ParseReport = {
      pdfPath,
      subjectName: `${subjectName} (Class ${icseClass})`,
      totalPages: numPages,
      chaptersFound: partialReport.chaptersFound ?? 0,
      topicsFound: partialReport.topicsFound ?? 0,
      unparsedSections: partialReport.unparsedSections ?? [],
      warnings: partialReport.warnings ?? [],
    };

    if (entries.length === 0) {
      console.warn(
        `  ⚠️  No entries found for CLASS ${icseClass} — check ingest-report.md`
      );
      appendToReport(report);
      continue;
    }

    const pdfUrl = meta
      ? `${BASE_URL}/${stem}.pdf`
      : `file://${pdfPath}`;

    const subjectFile: SubjectOmissionsFile = {
      subject_code: subjectCode,
      subject_name: subjectName,
      icse_class: icseClass,
      exam_year: examYear,
      effective_session: effectiveSession,
      source_pdf_url: pdfUrl,
      source_pdf_sha256: sha256,
      ingested_at: new Date().toISOString(),
      entries,
    };

    // Validate before writing — throws if schema is violated
    try {
      validateSubjectFile(subjectFile);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`  ✖ Validation failed for CLASS ${icseClass}: ${errMsg}`);
      report.warnings.push(`Validation error: ${String(err)}`);
      appendToReport(report);
      process.exitCode = 1;
      continue;
    }

    const outPath = writeSubjectJson(icseClass, subjectSlug, subjectFile);
    console.log(
      `  ✓ ${entries.length} entries → ${outPath}` +
        (report.unparsedSections.length > 0
          ? ` (${report.unparsedSections.length} unparsed sections)`
          : "")
    );

    appendToReport(report);
  }

  console.log(`  Report: ingest-report.md\n`);
}

main().catch((err) => {
  console.error("[ingest:cisce] Fatal error:", err);
  process.exit(1);
});
