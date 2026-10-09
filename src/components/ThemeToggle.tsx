import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Quick light/dark flip for the top bar. "System" is chosen in Settings. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const toLight = resolvedTheme !== 'light';
  const label = toLight ? 'Switch to light theme' : 'Switch to dark theme';
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label={label} onClick={() => setTheme(toLight ? 'light' : 'dark')}>
          {toLight ? <Sun /> : <Moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
