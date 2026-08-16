import { Home, List, Film, Tv, LogIn, LogOut, CalendarDays, BarChart3, Search } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const navigation = [
  { name: 'Discover', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'My List', href: '/watchlist', icon: List },
  { name: 'Upcoming', href: '/upcoming', icon: CalendarDays },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
];

const categories = [
  { name: 'Movies', href: '/movies', icon: Film },
  { name: 'TV Shows', href: '/shows', icon: Tv },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { watchlist } = useWatchlist();

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  const renderLink = (item: { name: string; href: string; icon: typeof Home }) => {
    const isActive = location.pathname === item.href;
    return (
      <NavLink
        key={item.name}
        to={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group relative flex items-center gap-3 h-10 pl-4 pr-3 text-sm rounded-lg transition-colors duration-150',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
            : 'text-sidebar-foreground font-medium hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
        )}
      >
        <span
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-primary transition-all duration-200',
            isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
          )}
        />
        <item.icon
          className={cn(
            'h-[18px] w-[18px] shrink-0 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
          )}
        />
        <span className="truncate">{item.name}</span>
        {item.name === 'My List' && watchlist.length > 0 && (
          <span className="ml-auto text-[11px] tabular-nums px-1.5 min-w-[20px] text-center py-0.5 rounded-md font-semibold bg-primary/12 text-primary">
            {watchlist.length}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-sidebar-border lg:bg-sidebar-background lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5">
        <NavLink to="/" className="flex items-center gap-2.5 rounded-lg -ml-1 p-1 transition-opacity hover:opacity-80">
          <Logo className="h-8 w-8" />
          <span className="text-[17px] font-bold text-sidebar-accent-foreground tracking-tight">Reel</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        <div className="space-y-0.5">{navigation.map(renderLink)}</div>

        <div className="space-y-0.5">
          <h3 className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
            Browse
          </h3>
          {categories.map(renderLink)}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 pt-2 border-t border-sidebar-border/70 space-y-2">
        {user ? (
          <div className="flex items-center gap-2.5 pl-2 pr-1 py-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="flex-1 min-w-0 text-xs font-medium text-sidebar-foreground truncate">
              {user.email}
            </p>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => signOut()}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              className="flex-1 rounded-xl h-10 gap-2"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  );
}

