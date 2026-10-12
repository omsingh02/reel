import { PageContainer, PageHeader } from '@/components/PageHeader';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { cn } from '@/lib/utils';

export interface LegalSectionDef {
  id: string;
  title: string;
}

interface LegalPageProps {
  title: string;
  eyebrow: string;
  description: string;
  path: string;
  updated?: string;
  /** Sections, in order, for the "On this page" list. Each must match a <LegalSection id>. */
  sections: LegalSectionDef[];
  children: React.ReactNode;
}

/** Long-form reading pages (About, Privacy, Terms): header, a quiet contents list, then prose. */
export function LegalPage({ title, eyebrow, description, path, updated, sections, children }: LegalPageProps) {
  return (
    <Layout>
      <Seo title={`${title} — Reel`} description={description} path={path} />
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <PageContainer className="pb-6">
        <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,42rem)] lg:gap-16">
          <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
            <p className="label-mono mb-3">On this page</p>
            <ul className="space-y-1.5 text-sm">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground underline-offset-4 transition-colors duration-fast hover:text-foreground hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            {updated && <p className="mt-6 font-mono text-xs text-subtle">Last updated {updated}</p>}
          </nav>

          <article className="min-w-0 space-y-12">{children}</article>
        </div>
      </PageContainer>
    </Layout>
  );
}

export function LegalSection({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('scroll-mt-24 space-y-3 text-[0.9375rem] leading-relaxed text-foreground/90 [&_a]:font-medium [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-foreground', className)}>
      <h2 className="text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5 marker:text-subtle">{children}</ul>;
}
