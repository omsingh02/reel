interface BrandIconProps {
  name: string;
  className?: string;
}

export function BrandIcon({ name, className = '' }: BrandIconProps) {
  switch (name) {
    case 'IMDb':
      return (
        <svg viewBox="0 0 64 32" className={className} fill="currentColor">
          <rect width="64" height="32" rx="4" fill="#F5C518" />
          <text x="32" y="23" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="18" fill="#000">
            IMDb
          </text>
        </svg>
      );
    case 'Netflix':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path d="M5.398 0v24l6.735-2.265L12 13.5l.133 8.235L18.602 24V0h-4.268v12L12 4.5l-2.334 7.5V0H5.398z" fill="#E50914" />
        </svg>
      );
    case 'TMDB':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="11" fill="#01D277" />
          <text x="12" y="16" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9" fill="#fff">
            T
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
  }
}
