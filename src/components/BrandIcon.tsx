interface BrandIconProps {
  name: string;
  className?: string;
}

/**
 * Small marks for external links. Drawn in `currentColor` so they follow the theme
 * (no third-party brand colours inside the interface).
 */
export function BrandIcon({ name, className = '' }: BrandIconProps) {
  if (name === 'IMDb') {
    return (
      <svg viewBox="0 0 32 16" className={className} role="img" aria-label="IMDb">
        <rect x="0.75" y="0.75" width="30.5" height="14.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="16" y="11.4" textAnchor="middle" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontWeight="600" fontSize="8.6" fill="currentColor">
          IMDb
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
