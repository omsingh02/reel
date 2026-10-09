import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Buttons. One primary action per view (signal vermilion); everything else is quieter.
 *  - default      the primary action
 *  - secondary    a raised neutral for common secondary actions
 *  - outline      bordered, for toolbars and filters
 *  - ghost        no chrome until hover; for icon buttons and nav
 *  - destructive  irreversible actions, only on confirmation surfaces
 *  - link         inline text action
 *  - overlay      frosted dark control that sits on artwork (posters, hero, player)
 */
const buttonVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-semibold",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-fast ease-snap",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-surface-3 disabled:text-subtle disabled:opacity-100",
        secondary: "border border-border bg-surface-2 text-foreground hover:bg-surface-3",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-accent",
        ghost: "bg-transparent text-foreground hover:bg-accent",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "h-auto rounded-sm px-0 text-primary-text underline-offset-4 hover:underline",
        overlay: "bg-scrim/60 text-white backdrop-blur-md hover:bg-scrim/80 [&_svg]:drop-shadow",
      },
      size: {
        xs: "h-7 px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8 px-3 text-[0.8125rem] [&_svg]:size-4",
        default: "h-10 px-4 text-sm [&_svg]:size-[1.125rem]",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-[1.125rem]",
        "icon-sm": "h-8 w-8 [&_svg]:size-4",
        "icon-xs": "h-7 w-7 [&_svg]:size-3.5",
        "icon-lg": "h-12 w-12 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // Default to type="button" so a button inside a form never submits by accident.
        {...(asChild ? {} : { type: type ?? "button" })}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
