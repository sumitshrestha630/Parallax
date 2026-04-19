import type { Weekday } from "@/types/balance";

export const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Inclusive hour range for calendar rows: 9 AM through 7 PM (rows are [h, h+1)). */
export const CALENDAR_START_HOUR = 9;
export const CALENDAR_END_HOUR   = 19;

export function calendarHours(): number[] {
  const out: number[] = [];
  for (let h = CALENDAR_START_HOUR; h < CALENDAR_END_HOUR; h++) out.push(h);
  return out;
}
