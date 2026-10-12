import { Link } from 'react-router-dom';
import { AccountMenu } from '@/components/AccountMenu';
import { LogoLockup } from '@/components/Logo';
import { SearchLink } from '@/components/SearchLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tag } from '@/components/ui/badge';
import { browseNav, isActive, libraryNav, type NavEntry } from '@/components/nav';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useBackgroundLocation } from '@/hooks/useBackgroundLocation';
import { cn } from '@/lib/utils';

function NavItem({ entry, pathname, badge }: { entry: NavEntry; pathname: string; badge?: number }) {
  const active = isActive(entry, pathname);
  return (
    <Link
      to={entry.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative inline-flex h-14 items-center gap-2 px-3 text-sm font-semibold transition-colors duration-fast',
        'after:absolute after:inset-x-3 after:bottom-[-1px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-base after:ease-snap',
        active ? 'text-foreground after:scale-x-100' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {entry.label}
      {badge ? <Tag className="numeral">{badge}</Tag> : null}
    </Link>
  );
}

/** The top bar: brand, primary navigation (wide screens), search, theme and account. */
export function TopNav() {
  const { pathname } = useBackgroundLocation();
  const { watchlist } = useWatchlist();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-content items-center gap-2 px-4 sm:px-6 lg:px-10">
        <Link to="/" aria-label="Reel, home" className="mr-3 rounded-md">
          <LogoLockup />
        </Link>

        <nav aria-label="Primary" className="hidden items-center lg:flex">
          {browseNav.map(e => <NavItem key={e.to} entry={e} pathname={pathname} />)}
          <span aria-hidden className="mx-2 h-5 w-px bg-border" />
          {libraryNav.map(e => (
            <NavItem key={e.to} entry={e} pathname={pathname} badge={e.to === '/watchlist' ? watchlist.length : undefined} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {pathname !== '/search' && <SearchLink className="mr-1" />}
          <ThemeToggle className="hidden sm:inline-flex" />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
