import { Home, Search, List, Tv, User, LogIn } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';

const navigation = [
  { name: 'Discover', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Shows', href: '/shows', icon: Tv },
  { name: 'My List', href: '/watchlist', icon: List },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-12 h-8 rounded-full mb-0.5 transition-all duration-200",
                isActive && "bg-primary/12 scale-110"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn("text-[11px]", isActive && "font-medium")}>{item.name}</span>
              {item.name === 'My List' && watchlist.length > 0 && (
                <span className="absolute top-1 right-0.5 h-4 min-w-4 text-[10px] bg-primary text-primary-foreground px-1 rounded-full flex items-center justify-center font-medium">
                  {watchlist.length}
                </span>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={() => navigate(user ? '/auth' : '/auth')}
          className={cn(
            "flex flex-col items-center justify-center h-full px-3 text-xs transition-colors",
            location.pathname === '/auth'
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-12 h-8 rounded-full mb-0.5 transition-all duration-200",
            location.pathname === '/auth' && "bg-primary/12 scale-110"
          )}>
            {user ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          </div>
          <span className={cn("text-[11px]", location.pathname === '/auth' && "font-medium")}>
            {user ? 'Account' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
}
