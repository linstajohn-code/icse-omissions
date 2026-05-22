import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — editorial stamp aesthetic.
 *
 * Square (no rounded-full), micro-uppercase typography.
 * Status variants use border-only treatment (no background fill) —
 * more refined than filled chips.
 */
const badgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 text-[10px] tracking-widest uppercase font-light transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline:
          "border-border/60 text-muted-foreground",
        included:
          "border-emerald-500/20 text-emerald-700/80 dark:text-emerald-400/70",
        omitted:
          "border-destructive/25 text-destructive/80",
        partial:
          "border-amber-500/20 text-amber-700/80 dark:text-amber-400/70",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
