import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Tags: small, square-cornered, mono, uppercase. Like the labels on a film can or a ticket
 * (MOVIE, TV, PG-13, WATCHED). They label; they don't act.
 */
const tagVariants = cva(
  "inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 font-mono text-[0.6875rem] font-medium uppercase leading-none tracking-[0.06em] [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface-2 text-muted-foreground",
        outline: "border-border-strong bg-transparent text-foreground",
        signal: "border-primary/35 bg-primary-subtle text-primary-text",
        gold: "border-warning/35 bg-warning-subtle text-warning-text",
        success: "border-success/35 bg-success-subtle text-success-text",
        destructive: "border-destructive/35 bg-destructive-subtle text-destructive-text",
        /** For use on top of artwork. */
        overlay: "border-white/15 bg-scrim/70 text-white backdrop-blur-sm",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {}

function Tag({ className, variant, ...props }: TagProps) {
  return <span className={cn(tagVariants({ variant }), className)} {...props} />;
}

export { Tag, Tag as Badge, tagVariants };
