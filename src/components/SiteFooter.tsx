import { Link } from 'react-router-dom';
import { LogoLockup } from '@/components/Logo';
import { legalNav } from '@/components/nav';

/** The footer: sign-off, legal links and the data attribution TMDB and JustWatch require. */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border text-muted-foreground">
      <div aria-hidden className="sprocket-x w-full text-border" />
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-10">
        <div className="max-w-sm space-y-3">
          <LogoLockup />
          <p className="text-sm">Track what you watch. Never miss what's next.</p>
        </div>

        <div className="max-w-xl space-y-4 text-sm lg:text-right">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 lg:justify-end">
            {legalNav.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="underline-offset-4 hover:text-foreground hover:underline">{l.label}</Link>
              </li>
            ))}
            <li>
              <a href="https://github.com/omsingh02/reel" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-foreground hover:underline">
                Source
              </a>
            </li>
          </ul>
          <p className="text-[0.8125rem] leading-relaxed text-subtle">
            Film and TV data and images from{' '}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">TMDB</a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability by JustWatch.
          </p>
        </div>
      </div>
    </footer>
  );
}
