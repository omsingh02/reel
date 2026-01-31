import { Home, List, TrendingUp, Film, Tv, User } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';
import { ThemeToggle } from './ThemeToggle';

const navigation = [
  { name: 'Discover', href: '/', icon: Home },
  { name: 'Watchlist', href: '/watchlist', icon: List },
  { name: 'Trending', href: '/trending', icon: TrendingUp },
  { name: 'Movies', href: '/movies', icon: Film },
  { name: 'TV', href: '/tv', icon: Tv },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist } = useWatchlistDB();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-14">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center h-full px-3 text-xs transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-0.5" />
              <span>{item.name}</span>
              {item.name === 'Watchlist' && user && watchlist.length > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 text-[10px] bg-primary text-primary-foreground px-1 rounded-full flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={() => navigate('/auth')}
          className={cn(
            "flex flex-col items-center justify-center h-full px-3 text-xs transition-colors",
            location.pathname === '/auth'
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="h-5 w-5 mb-0.5" />
          <span>{user ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </nav>
  );
}
