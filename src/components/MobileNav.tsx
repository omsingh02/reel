import { Home, List, TrendingUp, Film, Tv, User } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';

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
      <div className="flex items-center justify-around h-16">
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
              <div className={cn(
                "flex items-center justify-center w-14 h-8 rounded-full mb-0.5 transition-colors",
                isActive && "bg-primary/12"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px]">{item.name}</span>
              {item.name === 'Watchlist' && user && watchlist.length > 0 && (
                <span className="absolute top-1 right-0.5 h-4 min-w-4 text-[10px] bg-primary text-primary-foreground px-1 rounded-full flex items-center justify-center">
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
          <div className={cn(
            "flex items-center justify-center w-14 h-8 rounded-full mb-0.5 transition-colors",
            location.pathname === '/auth' && "bg-primary/12"
          )}>
            <User className="h-5 w-5" />
          </div>
          <span className="text-[11px]">{user ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </nav>
  );
}
