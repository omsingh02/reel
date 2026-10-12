import { cn } from '@/lib/utils';

/** A placeholder shaped like a MediaCard: a 2:3 poster, a title line and a data line. */
export function PosterSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('space-y-2.5', className)}>
      <div className="skeleton aspect-[2/3] w-full rounded-poster" />
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  );
}
