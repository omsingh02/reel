import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { DialogOverlay } from "@/components/ui/dialog";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const sheetVariants = cva(
  "fixed z-50 flex flex-col bg-card text-card-foreground shadow-float outline-none",
  {
    variants: {
      side: {
        bottom:
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl border-t border-border data-[state=open]:animate-slide-up data-[state=closed]:animate-slide-down",
        right:
          "inset-y-0 right-0 w-full max-w-md border-l border-border data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
      },
    },
    defaultVariants: { side: "bottom" },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideClose?: boolean;
}

/** A panel anchored to the bottom (phones) or right edge. Same focus trap and Escape handling as Dialog. */
const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ side = "bottom", className, children, hideClose, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), "pb-safe", className)} {...props}>
        {side === "bottom" && <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border-strong" />}
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 px-5 pb-3 pt-4 pr-12", className)} {...props} />
);
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("font-display text-lg font-semibold tracking-tight", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";
const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription };
