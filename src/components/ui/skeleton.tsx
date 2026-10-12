import { cn } from "@/lib/utils";

/** A placeholder that sweeps light across it. Size it with width/height classes. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skeleton", className)} {...props} />;
}

export { Skeleton };
