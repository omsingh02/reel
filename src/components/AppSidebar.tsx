import { Home, List, Film, Tv, LogIn, LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Discover', href: '/', icon: Home },
  { name: 'Watchlist', href: '/watchlist', icon: List },
];

const categories = [
  { name: 'Movies', href: '/movies', icon: Film },
  { name: 'TV Shows', href: '/tv', icon: Tv },
];

interface NavRowProps {
  href: string;
  icon: typeof Home;
  name: string;
  isActive: boolean;
  badge?: number;
}

function NavRow({ href, icon: Icon, name, isActive, badge }: NavRowProps) {
  return (
    <NavLink
      to={href}
      className={cn(
        "group relative flex items-center gap-3 pl-5 pr-3 h-10 text-sm transition-colors duration-150",
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:rounded-r-sm before:transition-all before:duration-200",
        isActive
          ? "text-foreground font-semibold before:h-6 before:bg-primary"
          : "text-muted-foreground hover:text-foreground before:h-0 hover:before:h-4 hover:before:bg-border"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className="tracking-tight">{name}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "ml-auto font-mono text-[10px] px-1.5 py-0.5 border transition-colors",
            isActive
              ? "border-primary/40 text-primary bg-primary/10"
              : "border-border text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { watchlist } = useWatchlistDB();

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:border-border/60 lg:bg-sidebar-background lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-border/60">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 bg-primary flex items-center justify-center transition-transform group-hover:rotate-[-6deg]">
            <Film className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold italic uppercase tracking-tight text-foreground">
            Watchlist<span className="text-primary">.</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="space-y-0.5">
          {navigation.map((item) => (
            <NavRow
              key={item.name}
              href={item.href}
              icon={item.icon}
              name={item.name}
              isActive={isActive(item.href)}
              badge={item.name === 'Watchlist' && user ? watchlist.length : undefined}
            />
          ))}
        </div>

        <div className="mt-8">
          <h3 className="px-5 mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Browse
          </h3>
          <div className="space-y-0.5">
            {categories.map((item) => (
              <NavRow
                key={item.name}
                href={item.href}
                icon={item.icon}
                name={item.name}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Theme
          </span>
          <ThemeToggle />
        </div>

        {user ? (
          <div className="flex items-center gap-2.5 px-2 py-2 hover:bg-sidebar-accent/60 transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none text-muted-foreground hover:text-destructive hover:bg-transparent shrink-0"
              onClick={() => signOut()}
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            className="w-full rounded-none h-10 gap-2 font-mono text-[11px] uppercase tracking-[0.2em]"
            onClick={() => navigate('/auth')}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </Button>
        )}
      </div>
    </aside>
  );
}
