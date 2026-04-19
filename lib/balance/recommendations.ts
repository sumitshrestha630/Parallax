import type { RecommendedSlot, ScheduleEvent, Weekday } from "@/types/balance";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, WEEKDAYS } from "@/lib/balance/constants";
import { intervalsOverlap, parseTimeToMinutes } from "@/lib/balance/time";

function isWindowFree(
  day: Weekday,
  startMin: number,
  endMin: number,
  events: ScheduleEvent[]
): boolean {
  return !events
    .filter(e => e.day === day)
    .some(e => {
      const s = parseTimeToMinutes(e.start_time);
      const en = parseTimeToMinutes(e.end_time);
      return intervalsOverlap(startMin, endMin, s, en);
    });
}

/**
 * Suggests up to `maxSlots` learning windows (60m) in free cells, preferring evenings on weekdays.
 */
export function computeRecommendedSlots(
  events: ScheduleEvent[],
  maxSlots = 6
): RecommendedSlot[] {
  const out: RecommendedSlot[] = [];

  const tryPush = (day: Weekday, hour: number, label: string) => {
    if (out.length >= maxSlots) return;
    const startMin = hour * 60;
    const endMin   = startMin + 60;
    if (startMin < CALENDAR_START_HOUR * 60 || endMin > CALENDAR_END_HOUR * 60) return;
    if (!isWindowFree(day, startMin, endMin, events)) return;
    out.push({
      id:    `rec-${day}-${hour}`,
      day,
      time:  `${String(hour).padStart(2, "0")}:00`,
      label,
    });
  };

  // Evenings first (5–7 PM): hours 17, 18
  for (const day of WEEKDAYS) {
    for (const hour of [17, 18]) {
      tryPush(day, hour, "Evening focus block");
    }
  }
  // Midday gaps
  for (const day of WEEKDAYS.slice(0, 5)) {
    for (let hour = CALENDAR_START_HOUR; hour < 15; hour++) {
      tryPush(day, hour, "Daytime study block");
    }
  }
  // Weekend mornings
  for (const day of WEEKDAYS.slice(5)) {
    for (const hour of [10, 11]) {
      tryPush(day, hour, "Weekend session");
    }
  }

  return out.slice(0, maxSlots);
}
