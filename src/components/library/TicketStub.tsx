import { Poster } from '@/components/reel';
import { Tag } from '@/components/ui/badge';
import { formatCalendarDate, yearOf } from '@/lib/dates';

interface TicketStubProps {
  title: string;
  /** "YYYY-MM-DD" of the release or episode. */
  date: string;
  /** "S4E11 · Episode name", or "Release". */
  detail: string;
  mediaType: 'movie' | 'tv';
  posterPath: string | null;
  onOpen: () => void;
}

/**
 * An upcoming release as a ticket: the date on the stub, a perforated tear line with notches,
 * then the poster and what is coming. The title is a real button stretched over the whole ticket.
 */
export function TicketStub({ title, date, detail, mediaType, posterPath, onOpen }: TicketStubProps) {
  const day = formatCalendarDate(date, { day: 'numeric' });
  const month = formatCalendarDate(date, { month: 'short' });
  const weekday = formatCalendarDate(date, { weekday: 'short' });

  return (
    <li className="relative flex overflow-hidden rounded-lg border border-border bg-card transition-colors duration-fast hover:border-border-strong">
      <div className="flex w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 px-2 py-3 text-center sm:w-24">
        <span className="label-mono">{weekday}</span>
        <span className="numeral font-display text-4xl font-semibold leading-none">{day}</span>
        <span className="label-mono">{month}</span>
      </div>

      <div aria-hidden className="relative w-0 self-stretch border-l-2 border-dashed border-border-strong">
        <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
        <span className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full border border-border bg-background" />
      </div>

      <div className="my-3 ml-3 w-11 shrink-0 self-center sm:w-12">
        <Poster path={posterPath} title={title} year={yearOf(date)} size="w154" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pl-3 pr-4">
        <h3 className="truncate text-[0.9375rem] font-semibold leading-snug">
          <button type="button" onClick={onOpen} className="stretched-link max-w-full truncate text-left">
            {title}
          </button>
        </h3>
        <p className="numeral truncate font-mono text-xs text-muted-foreground">{detail}</p>
        <div>
          <Tag>{mediaType === 'movie' ? 'Movie' : 'TV'}</Tag>
        </div>
      </div>
    </li>
  );
}
