import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Clapperboard, Compass, LogIn, LogOut, MoreHorizontal, Tv } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { isActive, legalNav, libraryNav, moreNav, type NavEntry } from '@/components/nav';
import { useAuth } from '@/contexts/AuthContext';
import { useBackgroundLocation } from '@/hooks/useBackgroundLocation';
import { useWatchlist } from '@/hooks/useWatchlist';
import { cn } from '@/lib/utils';

const tabs: NavEntry[] = [
  { to: '/', label: 'Discover', icon: Compass, end: true },
  { to: '/movies', label: 'Movies', icon: Clapperboard },
  { to: '/shows', label: 'Shows', icon: Tv },
  { to: '/watchlist', label: 'My List', icon: Bookmark },
];

const tabClass =
  'relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors duration-fast';

/** Bottom tab bar for phones and small tablets. "More" opens the rest of the app in a sheet. */
export function MobileTabBar() {
  const { pathname } = useBackgroundLocation();
  const { user, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const secondary = [...libraryNav.slice(1), ...moreNav];
  const moreActive = secondary.some(e => isActive(e, pathname));
  const go = (to: string) => { setMoreOpen(false); navigate(to); };

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-safe backdrop-blur-md lg:hidden"
      >
        <div className="flex h-16 items-stretch">
          {tabs.map(entry => {
            const active = isActive(entry, pathname);
            return (
              <Link
                key={entry.to}
                to={entry.to}
                aria-current={active ? 'page' : undefined}
                className={cn(tabClass, active ? 'text-foreground' : 'text-muted-foreground')}
              >
                {active && <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-b bg-primary" />}
                <span className="relative">
                  <entry.icon className="h-[1.375rem] w-[1.375rem]" aria-hidden />
                  {entry.to === '/watchlist' && watchlist.length > 0 && (
                    <span className="numeral absolute -right-3 -top-1.5 min-w-4 rounded-full bg-primary px-1 text-center font-mono text-[0.625rem] leading-4 text-primary-foreground">
                      {watchlist.length > 99 ? '99+' : watchlist.length}
                    </span>
                  )}
                </span>
                {entry.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            className={cn(tabClass, moreActive ? 'text-foreground' : 'text-muted-foreground')}
          >
            {moreActive && <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-b bg-primary" />}
            <MoreHorizontal className="h-[1.375rem] w-[1.375rem]" aria-hidden />
            More
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
            <SheetDescription className="sr-only">Other pages, appearance and account</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-3 pb-4">
            <ul className="space-y-0.5">
              {secondary.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <button
                    type="button"
                    onClick={() => go(to)}
                    className="flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-[0.9375rem] font-medium hover:bg-accent"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" aria-hidden /> {label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mx-3 mt-4 space-y-2">
              <p className="label-mono">Appearance</p>
              <ThemeSwitcher fill />
            </div>

            <div className="mx-3 mt-5">
              {user ? (
                <div className="space-y-2">
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <Button variant="outline" className="w-full" onClick={() => { setMoreOpen(false); void signOut(); }}>
                    <LogOut /> Sign out
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => go('/auth')}>
                  <LogIn /> Sign in to sync your list
                </Button>
              )}
            </div>

            <ul className="mx-3 mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-subtle">
              {legalNav.map(l => (
                <li key={l.to}>
                  <button type="button" onClick={() => go(l.to)} className="py-1.5 underline-offset-4 hover:text-foreground hover:underline">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
