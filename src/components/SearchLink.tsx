import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * The entry point to search. A field-shaped link on wide screens, an icon button on narrow ones.
 * (The real input lives on /search, so results and the URL stay in sync.)
 */
export function SearchLink({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/search"
      aria-label="Search movies and TV shows"
      className={cn(
        'inline-flex h-10 items-center gap-2.5 rounded-md border border-input bg-card text-sm text-subtle transition-colors duration-fast hover:border-border-strong hover:text-muted-foreground',
        'w-10 justify-center sm:w-64 sm:justify-start sm:px-3.5',
        className,
      )}
    >
      <Search className="h-[1.125rem] w-[1.125rem] shrink-0 text-muted-foreground" aria-hidden />
      <span className="hidden sm:inline">Search titles…</span>
    </Link>
  );
}
