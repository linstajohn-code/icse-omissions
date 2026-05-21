import fs from "node:fs";
import path from "node:path";
import type { SubjectOmissionsFile } from "../../src/types/ingest.js";

/** Writes /data/omissions/<class>/<subject-slug>.json. Creates directories if needed. */
export function writeSubjectJson(
  icseClass: 9 | 10,
  subjectSlug: string,
  data: SubjectOmissionsFile
): string {
  const dir = path.join("data", "omissions", String(icseClass));
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${subjectSlug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  return filePath;
}
