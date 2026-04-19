import type { ScheduleEvent, Weekday } from "@/types/balance";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR } from "@/lib/balance/constants";
import { parseTimeToMinutes } from "@/lib/balance/time";

/** Total minutes shown in each day column (9:00 → 19:00 exclusive end at 7 PM boundary). */
export const CALENDAR_VIEW_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60;

const VIEW_START_MIN = CALENDAR_START_HOUR * 60;
const VIEW_END_MIN   = CALENDAR_END_HOUR * 60;

/**
 * Pixel placement of an event inside one day column (must match column height = scale * CALENDAR_VIEW_MINUTES).
 */
export function layoutEventInColumn(
  event: ScheduleEvent,
  day: Weekday,
  columnHeightPx: number
): { topPx: number; heightPx: number } | null {
  if (event.day !== day) return null;
  const s  = parseTimeToMinutes(event.start_time);
  const en = parseTimeToMinutes(event.end_time);
  if (en <= s) return null;

  const clipS = Math.max(s, VIEW_START_MIN);
  const clipE = Math.min(en, VIEW_END_MIN);
  if (clipE <= clipS) return null;

  const topPx    = ((clipS - VIEW_START_MIN) / CALENDAR_VIEW_MINUTES) * columnHeightPx;
  const heightPx = Math.max(
    ((clipE - clipS) / CALENDAR_VIEW_MINUTES) * columnHeightPx,
    22
  );
  return { topPx, heightPx };
}

/** Map JS getDay() to our Weekday (week starts Monday). */
export function getTodayWeekday(): Weekday {
  const d = new Date().getDay();
  const order: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const idx = d === 0 ? 6 : d - 1;
  return order[idx]!;
}
