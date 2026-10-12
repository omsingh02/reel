import type { LucideIcon } from 'lucide-react';
import { Art, type ArtName } from '@/components/reel/art';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** A film-themed illustration. Preferred over `icon`. */
  art?: ArtName;
  /** Legacy: a plain icon. Used only when no `art` is given. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  /** Actions (buttons/links) shown under the text. */
  children?: React.ReactNode;
}

/** Empty, no-results and error states: an illustration, a plain title, one line of help, then actions. */
export function EmptyState({ art, icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center', className)}>
      {art ? (
        <Art name={art} className="mb-5" />
      ) : Icon ? (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      ) : (
        <Art name="generic" className="mb-5" />
      )}
      <h2 className="font-display text-xl font-semibold tracking-tight text-balance">{title}</h2>
      {description && <p className="mt-2 text-sm text-muted-foreground text-pretty">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
