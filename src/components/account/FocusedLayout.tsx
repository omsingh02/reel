import { Link } from 'react-router-dom';
import { LogoLockup } from '@/components/Logo';
import { legalNav } from '@/components/nav';

/** A bare frame for one-purpose screens reached from outside the app (the consent screen). */
export function FocusedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="mx-auto flex h-16 w-full max-w-content items-center px-5 sm:px-10">
        <Link to="/" aria-label="Reel, home" className="rounded-md">
          <LogoLockup />
        </Link>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-8 outline-none">
        {children}
      </main>
      <footer className="mx-auto flex w-full max-w-content flex-wrap gap-x-5 gap-y-1 px-5 py-6 font-mono text-xs text-subtle sm:px-10">
        {legalNav.filter(l => l.to !== '/about').map(l => (
          <Link key={l.to} to={l.to} className="underline-offset-4 hover:text-foreground hover:underline">{l.label}</Link>
        ))}
      </footer>
    </div>
  );
}
