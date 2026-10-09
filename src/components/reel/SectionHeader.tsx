import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** A link or control aligned right ("See all"). */
  action?: React.ReactNode;
  /** Heading level. Pages have one h1; sections are h2, sub-sections h3. */
  as?: 'h2' | 'h3';
  className?: string;
}

/** A section title in the display serif, with an optional one-line description and an action. */
export function SectionHeader({ title, subtitle, action, as: Tag = 'h2', className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <Tag className={cn('font-semibold tracking-tight', Tag === 'h2' ? 'font-display text-xl sm:text-2xl' : 'font-display text-lg')}>{title}</Tag>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
