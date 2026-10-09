import { cn } from '@/lib/utils';

/**
 * Monoline illustrations for empty and error states. Strokes follow `currentColor`;
 * the one accent detail uses the signal colour. Decorative, so hidden from assistive tech.
 */
export type ArtName = 'list' | 'search' | 'upcoming' | 'hidden' | 'stats' | 'error' | 'offline' | 'generic';

const accent = { stroke: 'hsl(var(--primary))' } as const;

function Perfs({ x, y, count = 4, gap = 11 }: { x: number; y: number; count?: number; gap?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <rect key={i} x={x} y={y + i * gap} width="4" height="6" rx="1.2" />
      ))}
    </>
  );
}

function Frame({ x = 0, y = 0, w = 84, h = 62, rotate = 0, perf = 4 }: { x?: number; y?: number; w?: number; h?: number; rotate?: number; perf?: number }) {
  return (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx="4" />
      <Perfs x={x + 5} y={y + 8} count={perf} gap={(h - 16 - 6) / (perf - 1)} />
      <Perfs x={x + w - 9} y={y + 8} count={perf} gap={(h - 16 - 6) / (perf - 1)} />
    </g>
  );
}

const drawings: Record<ArtName, JSX.Element> = {
  list: (
    <>
      <g opacity="0.5"><Frame x={30} y={22} rotate={-7} /></g>
      <Frame x={50} y={30} />
      <path d="M92 44v26l-7-5-7 5V44a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" style={accent} />
    </>
  ),
  search: (
    <>
      <Frame x={32} y={26} />
      <circle cx="100" cy="68" r="17" fill="hsl(var(--background))" style={accent} />
      <path d="m112.5 80.5 14 14" style={accent} strokeWidth="2.5" />
    </>
  ),
  upcoming: (
    <>
      <path d="M32 40h96a4 4 0 0 1 4 4v8a8 8 0 0 0 0 16v8a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4v-8a8 8 0 0 0 0-16v-8a4 4 0 0 1 4-4Z" transform="translate(0 -4)" />
      <path d="M62 38v44" strokeDasharray="3 4" />
      <path d="M76 52h38M76 64h26" style={accent} />
      <circle cx="45" cy="60" r="6" />
    </>
  ),
  hidden: (
    <>
      <Frame x={38} y={28} />
      <path d="M62 60s7-10 18-10 18 10 18 10-7 10-18 10-18-10-18-10Z" transform="translate(-9 0)" />
      <circle cx="71" cy="60" r="4" />
      <path d="m52 82 40-44" style={accent} strokeWidth="2.5" />
    </>
  ),
  stats: (
    <>
      <Frame x={34} y={24} w={92} h={70} />
      <path d="M58 82V66M72 82V54M86 82V60M100 82V46" style={accent} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  error: (
    <>
      <circle cx="80" cy="56" r="30" />
      {[0, 72, 144, 216, 288].map(a => (
        <circle key={a} cx={80 + 17 * Math.cos((a * Math.PI) / 180)} cy={56 + 17 * Math.sin((a * Math.PI) / 180)} r="5" />
      ))}
      <circle cx="80" cy="56" r="4" />
      <path d="M104 78c14 10 26 8 30 24" style={accent} />
    </>
  ),
  offline: (
    <>
      <circle cx="80" cy="56" r="30" />
      {[0, 72, 144, 216, 288].map(a => (
        <circle key={a} cx={80 + 17 * Math.cos((a * Math.PI) / 180)} cy={56 + 17 * Math.sin((a * Math.PI) / 180)} r="5" />
      ))}
      <path d="m52 88 56-64" style={accent} strokeWidth="2.5" />
    </>
  ),
  generic: (
    <>
      <Frame x={38} y={28} />
      <circle cx="80" cy="59" r="9" style={accent} />
    </>
  ),
};

export function Art({ name, className }: { name: ArtName; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 112"
      aria-hidden
      focusable="false"
      className={cn('h-28 w-40 text-subtle', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {drawings[name]}
    </svg>
  );
}
