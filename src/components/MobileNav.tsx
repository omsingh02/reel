import { Home, Search, List, Film, Tv, MoreHorizontal, LogIn, LogOut, CalendarDays, BarChart3, EyeOff, Sun, Moon } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Discover', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Movies', href: '/movies', icon: Film },
  { name: 'Shows', href: '/shows', icon: Tv },
  { name: 'My List', href: '/watchlist', icon: List },
];

const MORE_PATHS = ['/upcoming', '/stats', '/hidden'];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const { resolvedTheme, setTheme } = useTheme();

  const moreActive = MORE_PATHS.includes(location.pathname);
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "relative flex flex-1 min-w-0 flex-col items-center justify-center h-full px-0.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-8 rounded-full mb-0.5 transition-all duration-200",
                isActive && "bg-primary/12 scale-110"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn("text-[10px] truncate max-w-full", isActive && "font-medium")}>{item.name}</span>
              {item.name === 'My List' && watchlist.length > 0 && (
                <span className="absolute top-1 right-0 h-4 min-w-4 text-[10px] bg-primary text-primary-foreground px-1 rounded-full flex items-center justify-center font-medium">
                  {watchlist.length}
                </span>
              )}
            </NavLink>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-1 min-w-0 flex-col items-center justify-center h-full px-0.5 text-xs transition-colors",
                moreActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-8 rounded-full mb-0.5 transition-all duration-200",
                moreActive && "bg-primary/12 scale-110"
              )}>
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <span className={cn("text-[10px] truncate max-w-full", moreActive && "font-medium")}>More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2 w-60">
            <DropdownMenuItem onSelect={() => navigate('/upcoming')}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Upcoming
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/hidden')}>
              <EyeOff className="h-4 w-4 mr-2" />
              Hidden titles
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/stats')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme(nextTheme)}>
              {nextTheme === 'light' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {nextTheme === 'light' ? 'Light mode' : 'Dark mode'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onSelect={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <p className="px-2 py-1.5 text-[10px] leading-snug text-muted-foreground/70">
              This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability data by JustWatch.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
