import type {
  CalendarCellKind,
  RecommendedSlot,
  ScheduleEvent,
  Weekday,
} from "@/types/balance";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, WEEKDAYS } from "@/lib/balance/constants";
import { intervalsOverlap, parseTimeToMinutes } from "@/lib/balance/time";

export interface CalendarCellMeta {
  kind:     CalendarCellKind;
  tooltip?: string;
}

function eventsAtWindow(
  day: Weekday,
  hour: number,
  events: ScheduleEvent[]
): ScheduleEvent[] {
  const ws = hour * 60;
  const we = (hour + 1) * 60;
  return events.filter(e => {
    if (e.day !== day) return false;
    const s = parseTimeToMinutes(e.start_time);
    const en = parseTimeToMinutes(e.end_time);
    return intervalsOverlap(ws, we, s, en);
  });
}

function recommendedAt(day: Weekday, hour: number, slots: RecommendedSlot[]): RecommendedSlot | undefined {
  return slots.find(s => s.day === day && parseInt(s.time.slice(0, 2), 10) === hour);
}

/**
 * Build per-cell state for the weekly grid.
 */
export function buildCalendarGrid(
  events: ScheduleEvent[],
  recommended: RecommendedSlot[]
): Map<string, CalendarCellMeta> {
  const map = new Map<string, CalendarCellMeta>();

  for (const day of WEEKDAYS) {
    for (let hour = CALENDAR_START_HOUR; hour < CALENDAR_END_HOUR; hour++) {
      const key = `${day}-${hour}`;
      const evs   = eventsAtWindow(day, hour, events);
      const rec   = recommendedAt(day, hour, recommended);

      if (evs.length > 0) {
        const busy = evs.some(e => e.intensity === "busy");
        const tip  = evs.map(e => `${e.title} (${e.start_time}–${e.end_time})`).join(" · ");
        map.set(key, {
          kind: busy ? "busy" : "medium",
          tooltip: tip,
        });
      } else if (rec) {
        map.set(key, {
          kind: "recommended",
          tooltip: `${rec.label} · ${rec.time.slice(0, 5)}`,
        });
      } else {
        map.set(key, { kind: "free", tooltip: "Free" });
      }
    }
  }

  return map;
}
