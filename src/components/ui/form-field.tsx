import * as React from "react";
import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  /** Short helper text under the field. */
  hint?: React.ReactNode;
  /** Validation message. Shown in place of the hint and announced to assistive tech. */
  error?: string | null;
  /** Something rendered at the right of the label row (e.g. "Forgot password?"). */
  labelAction?: React.ReactNode;
  className?: string;
  /** Render-prop so the control gets the right id and aria wiring. */
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode;
}

/**
 * Label + control + hint/error, wired for accessibility. Errors live under the field,
 * not only in a toast, so people can see which input to fix.
 */
export function FormField({ id, label, hint, error, labelAction, className, children }: FormFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-[0.8125rem] text-destructive-text">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
