import fs from "node:fs";
import type { ParseReport } from "../../src/types/ingest.js";

const REPORT_PATH = "ingest-report.md";

/** Appends one subject's parse results to ingest-report.md. Never overwrites existing entries. */
export function appendToReport(report: ParseReport): void {
  const timestamp = new Date().toISOString().split("T")[0]!;
  const status = report.unparsedSections.length > 0 ? "⚠️ ISSUES" : "✅ OK";

  const lines: string[] = [
    "",
    `## ${status} — ${report.subjectName} (${timestamp})`,
    "",
    `- **PDF:** \`${report.pdfPath}\``,
    `- **Pages:** ${report.totalPages}`,
    `- **Chapters found:** ${report.chaptersFound}`,
    `- **Topics found:** ${report.topicsFound}`,
  ];

  if (report.warnings.length > 0) {
    lines.push("", "### Warnings");
    for (const w of report.warnings) {
      lines.push(`- ${w}`);
    }
  }

  if (report.unparsedSections.length > 0) {
    lines.push("", "### Unparsed sections (require human review)");
    for (const s of report.unparsedSections) {
      lines.push("");
      lines.push(`**Page ${s.pageNum}** — ${s.reason}`);
      lines.push("```");
      lines.push(s.rawExcerpt.slice(0, 300));
      lines.push("```");
    }
  }

  lines.push("");
  lines.push("---");

  fs.appendFileSync(REPORT_PATH, lines.join("\n") + "\n");
}

/** Writes the initial report header if the file doesn't already exist. */
export function ensureReportExists(): void {
  if (!fs.existsSync(REPORT_PATH)) {
    const header = [
      "# Ingest Report",
      "",
      "> This file is the canonical record of every issue encountered during PDF inspection and ingestion.",
      "> It is append-only — issues are never deleted, only resolved with a dated note.",
      "",
      "---",
      "",
    ].join("\n");
    fs.writeFileSync(REPORT_PATH, header);
  }
}
