import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Screen-reader text. */
  label?: string;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

/** A film reel turning. */
export function LoadingSpinner({ className, size = 'md', label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div role="status" className={cn('flex items-center justify-center', className)}>
      <svg viewBox="0 0 32 32" className={cn('animate-spin text-muted-foreground [animation-duration:1.4s]', sizeMap[size])} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="16" cy="16" r="13" />
        {[0, 72, 144, 216, 288].map(a => (
          <circle key={a} cx={16 + 7 * Math.cos((a * Math.PI) / 180)} cy={16 + 7 * Math.sin((a * Math.PI) / 180)} r="2.2" fill="currentColor" stroke="none" />
        ))}
        <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
