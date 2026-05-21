"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ClassToggleProps {
  activeClass: 9 | 10;
}

export function ClassToggle({ activeClass }: ClassToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  function switchClass(cls: 9 | 10) {
    // Replace /class/9/ with /class/10/ (or vice versa) anywhere in the path
    const newPath = pathname.replace(/\/class\/(9|10)(\/|$)/, `/class/${cls}$2`);
    router.push(newPath !== pathname ? newPath : `/class/${cls}`);
  }

  return (
    <div
      role="group"
      aria-label="Select class"
      className="inline-flex rounded-lg border border-border bg-muted p-1 gap-1"
    >
      {([9, 10] as const).map((cls) => (
        <button
          key={cls}
          onClick={() => switchClass(cls)}
          aria-pressed={activeClass === cls}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            activeClass === cls
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Class {cls}
        </button>
      ))}
    </div>
  );
}
