import { Skeleton } from '@/components/ui/skeleton';

/** The title page while it loads: shaped like the real thing (hero, actions, two columns). */
export function TitleSkeleton({ shell }: { shell: string }) {
  return (
    <div aria-busy="true">
      <div className="relative">
        <Skeleton className="aspect-[3/2] max-h-[min(34rem,62vh)] w-full rounded-none sm:aspect-[2/1] lg:aspect-[2.39/1]" />
        <div className={`${shell} absolute inset-x-0 bottom-0 pb-6 sm:pb-8`}>
          <div className="flex items-end gap-6">
            <Skeleton className="hidden aspect-[2/3] w-32 shrink-0 translate-y-14 sm:block lg:w-44 lg:translate-y-24" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-9 w-3/4 sm:h-12" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div className={`${shell} pt-5 sm:pl-[9.5rem] sm:pt-2 lg:pl-[12.5rem]`}>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-28" />
        </div>
      </div>

      <div className={`${shell} mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14`}>
        <div className="space-y-4 lg:col-span-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-8 h-6 w-24" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
        <div className="space-y-5 lg:col-span-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
