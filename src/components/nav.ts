import { BarChart3, Bookmark, CalendarDays, Clapperboard, Compass, EyeOff, Settings, Tv, type LucideIcon } from 'lucide-react';

export interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Match only this exact path (otherwise any path under it is "active"). */
  end?: boolean;
}

/** Browse the catalogue. */
export const browseNav: NavEntry[] = [
  { to: '/', label: 'Discover', icon: Compass, end: true },
  { to: '/movies', label: 'Movies', icon: Clapperboard },
  { to: '/shows', label: 'TV Shows', icon: Tv },
];

/** Your own things. */
export const libraryNav: NavEntry[] = [
  { to: '/watchlist', label: 'My List', icon: Bookmark },
  { to: '/upcoming', label: 'Upcoming', icon: CalendarDays },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
];

/** Secondary destinations, reached from the account menu and the mobile "More" sheet. */
export const moreNav: NavEntry[] = [
  { to: '/hidden', label: 'Hidden titles', icon: EyeOff },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const legalNav = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

export function isActive(entry: NavEntry, pathname: string): boolean {
  return entry.end ? pathname === entry.to : pathname === entry.to || pathname.startsWith(entry.to + '/');
}
