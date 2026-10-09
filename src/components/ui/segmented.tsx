import * as React from "react";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Accessible name when the label is an icon or abbreviated on small screens. */
  ariaLabel?: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  onValueChange: (value: NoInfer<T>) => void;
  options: SegmentedOption<T>[];
  /** Names the group for assistive tech ("Appearance", "Media type"...). */
  "aria-label": string;
  size?: "sm" | "md";
  /** Stretch to fill the container, options share the width equally. */
  fill?: boolean;
  className?: string;
}

/**
 * A switch between a few exclusive options (Movies / TV, To watch / Watched, Light / Dark / System).
 * A radio group underneath: arrow keys move the selection, Tab leaves the group.
 */
export function Segmented<const T extends string>({
  value,
  onValueChange,
  options,
  size = "md",
  fill,
  className,
  "aria-label": ariaLabel,
}: SegmentedProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const last = options.length - 1;
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? last : e.key === "ArrowRight" || e.key === "ArrowDown" ? (index + 1) % options.length : (index - 1 + options.length) % options.length;
    onValueChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-0.5 rounded-md border border-border bg-surface-2 p-0.5", fill && "flex w-full", className)}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.ariaLabel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[0.3125rem] font-semibold transition-[background-color,color,box-shadow] duration-fast ease-snap",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3.5 text-[0.8125rem]",
              "[&_svg]:size-4 [&_svg]:shrink-0",
              fill && "flex-1",
              selected
                ? "bg-card text-foreground shadow-panel ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
