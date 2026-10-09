import { LogIn, LogOut, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { moreNav, libraryNav } from '@/components/nav';
import { useAuth } from '@/contexts/AuthContext';

/** Signed in: an initials button with the account menu. Guest: a Sign in button. */
export function AccountMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <>
        <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
          <Link to="/auth">
            <LogIn /> Sign in
          </Link>
        </Button>
        <Button asChild size="icon" variant="ghost" className="sm:hidden">
          <Link to="/auth" aria-label="Sign in">
            <UserRound />
          </Link>
        </Button>
      </>
    );
  }

  const initials = (user.email ?? 'U').slice(0, 2);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block text-xs text-subtle">Signed in as</span>
          <span className="block truncate text-sm font-semibold text-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {[...libraryNav.slice(0, 1), ...moreNav].map(({ to, label, icon: Icon }) => (
          <DropdownMenuItem key={to} onSelect={() => navigate(to)}>
            <Icon /> {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
