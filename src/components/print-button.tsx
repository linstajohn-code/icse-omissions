"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
    >
      <Printer className="h-4 w-4" aria-hidden />
      Print / Save as PDF
    </button>
  );
}
