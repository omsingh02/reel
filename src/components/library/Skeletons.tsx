import { Skeleton } from '@/components/ui/skeleton';

/** Rows shaped like My List entries. */
export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status">
      <span className="sr-only">Loading your list</span>
      <ul aria-hidden className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <Skeleton className="aspect-[2/3] w-14 shrink-0 rounded-poster sm:w-16" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tickets while upcoming dates are being worked out. */
export function StubSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status">
      <span className="sr-only">Checking release dates</span>
      <div aria-hidden className="space-y-3">
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex w-24 flex-col items-center gap-2 px-2 py-4">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex flex-1 items-center gap-3 border-l-2 border-dashed border-border-strong p-3">
              <Skeleton className="aspect-[2/3] w-12 rounded-poster" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A poster grid placeholder (Hidden titles). */
export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status">
      <span className="sr-only">Loading hidden titles</span>
      <div aria-hidden className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <Skeleton className="aspect-[2/3] w-full rounded-poster" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
