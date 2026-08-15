import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Compact entry point to the search page. Looks like a search field on
 * desktop, collapses to an icon button on small screens.
 */
export function SearchLink({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/search"
      aria-label="Search movies and TV shows"
      className={cn(
        'inline-flex items-center gap-2 h-10 rounded-full bg-secondary/60 border border-border/50 text-muted-foreground hover:text-foreground transition-colors',
        'w-10 justify-center sm:w-64 sm:justify-start sm:px-4',
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline text-sm">Search titles…</span>
    </Link>
  );
}
