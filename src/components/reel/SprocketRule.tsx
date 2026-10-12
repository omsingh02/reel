import { cn } from '@/lib/utils';

/** A decorative row of film-sprocket holes, used as a divider. Colour follows `text-*`. */
export function SprocketRule({ className }: { className?: string }) {
  return <div aria-hidden className={cn('sprocket-x w-full text-border', className)} />;
}
