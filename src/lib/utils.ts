import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a chapter name to a URL slug.
 *
 * Case is intentionally preserved so that chapters whose names differ only in
 * capitalisation produce distinct URLs (e.g. Physical Education has both
 * "Fundamental skills and technique" (Cricket) and
 * "Fundamental Skills and Technique" (Football) as separate chapters).
 *
 * Inverse: `decodeURIComponent(slug).replace(/-/g, " ")` → original name.
 * Matching in getChapterDetail uses exact case comparison.
 */
export function chapterToSlug(name: string): string {
  return encodeURIComponent(name.replace(/\s+/g, "-"));
}
