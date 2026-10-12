import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}

/**
 * The search field: large and calm. Typing searches after a short pause; Escape or the clear
 * button empties it and puts the cursor back.
 */
export function SearchBar({
  onSearch,
  placeholder = "Search movies and TV shows…",
  className,
  defaultValue = '',
  autoFocus = false,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 400);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div role="search" className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        type="text"
        name="q"
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        aria-label="Search"
        enterKeyHint="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-12 w-full rounded-md border border-input bg-card pl-12 pr-12 text-base text-foreground transition-colors duration-fast placeholder:text-subtle hover:border-border-strong focus-visible:border-ring focus-visible:outline-offset-0"
      />
      {value && (
        <Button variant="ghost" size="icon-sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleClear} aria-label="Clear search">
          <X />
        </Button>
      )}
    </div>
  );
}
