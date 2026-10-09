import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { formatCalendarDate, fromDateInputValue, hasAired, isTodayOrLater, parseCalendarDate, toDateInputValue, yearOf } from './dates';

describe('calendar dates', () => {
  const originalTz = process.env.TZ;
  beforeEach(() => { process.env.TZ = 'America/Los_Angeles'; });
  afterEach(() => { process.env.TZ = originalTz; });

  it('keeps the calendar day west of UTC', () => {
    expect(parseCalendarDate('2026-10-12')?.getDate()).toBe(12);
    expect(formatCalendarDate('2026-10-12', { day: 'numeric' }, 'en-US')).toBe('12');
  });

  it('reads the year straight from the string', () => {
    expect(yearOf('2000-01-01')).toBe(2000);
    expect(yearOf('')).toBeNull();
    expect(yearOf(undefined)).toBeNull();
  });

  it('returns null for empty or garbage input', () => {
    expect(parseCalendarDate('')).toBeNull();
    expect(parseCalendarDate('not a date')).toBeNull();
  });

  it('compares against the local calendar day', () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    expect(isTodayOrLater(today)).toBe(true);
    expect(hasAired(today)).toBe(true);
    expect(isTodayOrLater('1999-01-01')).toBe(false);
    expect(hasAired('2999-01-01')).toBe(false);
    expect(hasAired(null)).toBe(false);
  });

  it('round-trips a date input value without slipping a day', () => {
    const iso = fromDateInputValue('2025-03-04');
    expect(iso).not.toBeNull();
    expect(toDateInputValue(iso)).toBe('2025-03-04');
    expect(fromDateInputValue('')).toBeNull();
    expect(toDateInputValue(null)).toBe('');
  });
});
