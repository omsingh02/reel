import { PosterSkeleton } from '@/components/browse/PosterSkeleton';

interface MediaGridSkeletonProps {
  count?: number;
}

/** The loading state of a poster grid: same columns and gaps as MediaGrid. */
export function MediaGridSkeleton({ count = 12 }: MediaGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <span className="sr-only">Loading titles</span>
      {Array.from({ length: count }).map((_, i) => (
        <PosterSkeleton key={i} />
      ))}
    </div>
  );
}
