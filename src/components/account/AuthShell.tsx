import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LogoLockup } from '@/components/Logo';
import { SprocketRule } from '@/components/reel';
import { legalNav } from '@/components/nav';

/**
 * The frame for sign-in, sign-up and password reset: on desktop a brand panel beside the form,
 * on phones just the form under a compact header. The panel carries the `dark` class so it stays
 * a lit projection room in both themes.
 */
function BrandPanel() {
  return (
    <aside className="dark grain relative hidden overflow-hidden bg-background text-foreground lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:border-r lg:border-border lg:p-12 xl:p-16">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-32 h-[26rem] w-[26rem] rounded-full bg-rating/10 blur-3xl" />

      <Link to="/" aria-label="Reel, home" className="relative z-10 w-fit rounded-md">
        <LogoLockup />
      </Link>

      <div className="relative z-10 max-w-xl">
        <p className="label-mono mb-6">Watchlist · Episodes · Ratings</p>
        <p className="font-display text-display font-semibold text-balance xl:text-display-lg">
          Every film you've seen. Every episode you haven't.
        </p>
      </div>

      <div className="relative z-10 space-y-4">
        <SprocketRule className="text-border-strong" />
        <p className="font-mono text-xs text-muted-foreground">Catalogue data from TMDB. Your list stays yours.</p>
      </div>
    </aside>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <a href="#main" className="skip-link">Skip to content</a>
      <BrandPanel />

      <div className="flex min-h-dvh flex-col px-5 sm:px-10">
        <header className="flex h-16 items-center justify-between">
          <Link to="/" aria-label="Reel, home" className="rounded-md lg:invisible">
            <LogoLockup />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors duration-fast hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Reel
          </Link>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8 outline-none">
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-sm flex-wrap gap-x-5 gap-y-1 py-6 font-mono text-xs text-subtle">
          {legalNav.filter(l => l.to !== '/about').map(l => (
            <Link key={l.to} to={l.to} className="underline-offset-4 hover:text-foreground hover:underline">{l.label}</Link>
          ))}
        </footer>
      </div>
    </div>
  );
}
