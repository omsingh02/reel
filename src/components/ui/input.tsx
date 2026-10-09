import * as React from "react";

import { cn } from "@/lib/utils";

/** Text field. Paper-white (card) fill with a visible outline; the focus ring comes from the global rule. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground",
          "placeholder:text-subtle transition-colors duration-fast",
          "hover:border-border-strong focus-visible:border-ring focus-visible:outline-offset-0",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:outline-destructive",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
