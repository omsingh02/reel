import { Home, List, TrendingUp, Film, Tv } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

const navigation = [
  { name: 'Discover', href: '/', icon: Home },
  { name: 'Watchlist', href: '/watchlist', icon: List },
  { name: 'Trending', href: '/trending', icon: TrendingUp },
];

const categories = [
  { name: 'Movies', href: '/movies', icon: Film },
  { name: 'TV Shows', href: '/tv', icon: Tv },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { watchlist } = useWatchlistDB();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:border-border lg:bg-surface-container-low">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <Film className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">Watchlist</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-full transition-colors",
                  isActive 
                    ? "bg-primary/12 text-primary" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {item.name === 'Watchlist' && user && watchlist.length > 0 && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {watchlist.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="px-4 text-xs font-medium text-muted-foreground mb-2">
            Browse
          </h3>
          <div className="space-y-1">
            {categories.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-full transition-colors",
                    isActive 
                      ? "bg-primary/12 text-primary" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
