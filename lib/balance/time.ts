/**
 * Parse "HH:MM", "H:MM", or "HH:MM:SS" (Postgres / HTML time) to minutes from midnight.
 */
export function parseTimeToMinutes(t: string): number {
  const parts = t.trim().split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mi = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return mi === 0 ? `${hr} ${ampm}` : `${hr}:${String(mi).padStart(2, "0")} ${ampm}`;
}

/** Hour row label 9 → "9 AM" for display in grid header column. */
export function formatHourRow(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

/**
 * Whether [windowStart, windowEnd) minutes overlaps [start, end) event (same day).
 */
export function intervalsOverlap(
  windowStartMin: number,
  windowEndMin: number,
  eventStartMin: number,
  eventEndMin: number
): boolean {
  return eventStartMin < windowEndMin && eventEndMin > windowStartMin;
}
