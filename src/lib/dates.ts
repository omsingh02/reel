/**
 * TMDB dates are calendar dates ("2026-10-12") with no timezone. Passing them
 * to `new Date()` parses them as UTC midnight, which shifts them a day back
 * (and can change the year) for anyone west of UTC. Everything that displays
 * or compares a TMDB date goes through here instead.
 */

export function parseCalendarDate(value?: string | null): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) {
    const fallback = new Date(value);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function yearOf(value?: string | null): number | null {
  const m = value ? /^(\d{4})/.exec(value) : null;
  return m ? Number(m[1]) : null;
}

export function formatCalendarDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
  locale?: string
): string {
  const d = parseCalendarDate(value);
  return d ? d.toLocaleDateString(locale, options) : '';
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** True when the date is today or later (local calendar). */
export function isTodayOrLater(value?: string | null): boolean {
  const d = parseCalendarDate(value);
  return !!d && d.getTime() >= startOfToday().getTime();
}

/** True when the date is known and has already arrived (today counts). */
export function hasAired(value?: string | null): boolean {
  const d = parseCalendarDate(value);
  return !!d && d.getTime() <= startOfToday().getTime();
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** ISO timestamp -> "YYYY-MM-DD" in the viewer's timezone, for <input type="date">. */
export function toDateInputValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "YYYY-MM-DD" from a date input -> ISO at local noon, so it never slips a day across timezones. */
export function fromDateInputValue(value: string): string | null {
  const d = parseCalendarDate(value);
  if (!d) return null;
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

/** Today as "YYYY-MM-DD" (local), e.g. for a date input's `max`. */
export function todayInputValue(): string {
  return toDateInputValue(new Date().toISOString());
}
