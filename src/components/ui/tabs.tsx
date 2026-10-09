import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/** Underlined tabs: a hairline rail with a signal-coloured bar under the active tab. */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("flex items-center gap-1 border-b border-border", className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative -mb-px inline-flex h-11 items-center justify-center whitespace-nowrap px-3.5 text-sm font-semibold text-muted-foreground",
      "transition-colors duration-fast hover:text-foreground disabled:pointer-events-none disabled:opacity-45",
      "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-base after:ease-snap",
      "data-[state=active]:text-foreground data-[state=active]:after:scale-x-100",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-5 focus-visible:outline-offset-4", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
