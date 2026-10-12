/**
 * Defensive localStorage helpers for the guest stores (watchlist, hidden titles,
 * episode progress).
 *
 * Browser storage is user-editable and survives app upgrades, so what we read back
 * can be truncated, hand-edited, written by an older build, or just not an array.
 * Trusting it blindly crashes the app on load, and writing the (empty) fallback back
 * would erase the user's data. So: validate every entry, keep the ones that are fine,
 * and stash the original text under `<key>:corrupt` whenever anything had to be dropped.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function backupCorrupt(key: string, raw: string) {
  try {
    const backupKey = `${key}:corrupt`;
    if (localStorage.getItem(backupKey) !== raw) localStorage.setItem(backupKey, raw);
  } catch {
    // Storage full or unavailable — nothing more we can do.
  }
}

/**
 * Reads a JSON array, keeping only entries `parse` accepts (it returns null to reject one),
 * and drops duplicates by `keyOf` (first one wins) so lists never render duplicate React keys.
 */
export function readStoredArray<T>(
  key: string,
  parse: (raw: unknown) => T | null,
  keyOf: (item: T) => string
): T[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return []; // storage blocked (e.g. some private modes)
  }
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    backupCorrupt(key, raw);
    return [];
  }
  if (!Array.isArray(data)) {
    backupCorrupt(key, raw);
    return [];
  }

  const seen = new Set<string>();
  const out: T[] = [];
  let dropped = 0;
  for (const entry of data) {
    const item = parse(entry);
    if (item === null) { dropped++; continue; }
    const k = keyOf(item);
    if (seen.has(k)) { dropped++; continue; }
    seen.add(k);
    out.push(item);
  }
  if (dropped > 0) backupCorrupt(key, raw);
  return out;
}

/** Writes JSON, reporting failure instead of throwing (quota exceeded, private mode). */
export function writeStored(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
