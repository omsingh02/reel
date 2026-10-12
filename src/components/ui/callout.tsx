import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const calloutVariants = cva("flex gap-3 rounded-lg border p-3.5 text-sm", {
  variants: {
    tone: {
      info: "border-border bg-surface-2 text-foreground [&>svg]:text-muted-foreground",
      success: "border-success/35 bg-success-subtle text-foreground [&>svg]:text-success-text",
      warning: "border-warning/35 bg-warning-subtle text-foreground [&>svg]:text-warning-text",
      destructive: "border-destructive/35 bg-destructive-subtle text-foreground [&>svg]:text-destructive-text",
    },
  },
  defaultVariants: { tone: "info" },
});

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, destructive: OctagonAlert };

interface CalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof calloutVariants> {
  title?: React.ReactNode;
}

/** An inline message: notices, warnings and form-level errors. */
function Callout({ tone = "info", title, className, children, ...props }: CalloutProps) {
  const Icon = icons[tone ?? "info"];
  return (
    <div role={tone === "destructive" ? "alert" : "status"} className={cn(calloutVariants({ tone }), className)} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}

export { Callout };
