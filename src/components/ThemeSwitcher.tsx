import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Segmented } from '@/components/ui/segmented';

type ThemeChoice = 'light' | 'dark' | 'system';

/** Light / Dark / System. The choice is remembered by next-themes. */
export function ThemeSwitcher({ className, fill }: { className?: string; fill?: boolean }) {
  const { theme = 'dark', setTheme } = useTheme();
  return (
    <Segmented<ThemeChoice>
      aria-label="Appearance"
      value={(theme as ThemeChoice) ?? 'dark'}
      onValueChange={setTheme}
      fill={fill}
      className={className}
      options={[
        { value: 'light', label: 'Light', icon: <Sun /> },
        { value: 'dark', label: 'Dark', icon: <Moon /> },
        { value: 'system', label: 'System', icon: <Monitor /> },
      ]}
    />
  );
}
