import { cn } from '@/lib/utils';

/** Width and gutters shared by every page, so content lines up with the top bar. */
export function PageContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-content px-4 sm:px-6 lg:px-10', className)} {...props} />;
}

interface PageHeaderProps {
  title: React.ReactNode;
  /** A small mono label above the title ("Library", "Browse"). */
  eyebrow?: string;
  description?: React.ReactNode;
  /** Buttons or controls aligned to the right of the title on wide screens. */
  actions?: React.ReactNode;
  className?: string;
}

/** The page's single <h1>: serif title, optional eyebrow and description, optional actions. */
export function PageHeader({ title, eyebrow, description, actions, className }: PageHeaderProps) {
  return (
    <PageContainer className={cn('pb-6 pt-8 sm:pb-8 sm:pt-12', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && <p className="label-mono">{eyebrow}</p>}
          <h1 className="text-display-sm text-balance sm:text-display">{title}</h1>
          {description && <p className="max-w-prose text-[0.9375rem] text-muted-foreground text-pretty">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </PageContainer>
  );
}
