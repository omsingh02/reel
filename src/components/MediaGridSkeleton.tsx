import { Skeleton } from '@/components/ui/skeleton';

interface MediaGridSkeletonProps {
  count?: number;
}

export function MediaGridSkeleton({ count = 12 }: MediaGridSkeletonProps) {
  return (
    <div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50">
          <div className="relative aspect-[2/3] m-1.5 mb-0 rounded-xl overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
