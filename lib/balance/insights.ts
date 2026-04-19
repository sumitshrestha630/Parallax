import type { BalanceInsight, ScheduleEvent, Weekday } from "@/types/balance";
import { WEEKDAYS } from "@/lib/balance/constants";
import { parseTimeToMinutes } from "@/lib/balance/time";

const EVENING_START_MIN = 17 * 60; // 5 PM
const DAY_END_MIN       = 24 * 60;

/** Minutes of `class` events per weekday (academic load proxy). */
function classMinutesByDay(events: ScheduleEvent[]): Record<Weekday, number> {
  const acc = Object.fromEntries(WEEKDAYS.map(d => [d, 0])) as Record<Weekday, number>;
  for (const e of events) {
    if (e.type !== "class") continue;
    const s = parseTimeToMinutes(e.start_time);
    const en = parseTimeToMinutes(e.end_time);
    acc[e.day] += Math.max(0, en - s);
  }
  return acc;
}

function freeEveningSlots(events: ScheduleEvent[], day: Weekday): number {
  const dayEvents = events.filter(e => e.day === day);
  const occupied = (startMin: number, endMin: number) =>
    dayEvents.some(e => {
      const s = parseTimeToMinutes(e.start_time);
      const en = parseTimeToMinutes(e.end_time);
      return s < endMin && en > startMin;
    });
  let free = 0;
  for (let m = EVENING_START_MIN; m < DAY_END_MIN - 60; m += 60) {
    if (!occupied(m, m + 60)) free++;
  }
  return free;
}

export function computeBalanceInsight(events: ScheduleEvent[]): BalanceInsight {
  const byDay = classMinutesByDay(events);
  const heavyThresholdMin = 3 * 60;
  let heavyAcademicDays = 0;
  for (const d of WEEKDAYS.slice(0, 5)) {
    if (byDay[d] >= heavyThresholdMin) heavyAcademicDays++;
  }

  let freeEvenings = 0;
  for (const d of WEEKDAYS.slice(0, 5)) {
    freeEvenings += freeEveningSlots(events, d);
  }

  const busyScore = WEEKDAYS.map(d => ({
    d,
    m: events
      .filter(e => e.day === d)
      .reduce((sum, e) => sum + Math.max(0, parseTimeToMinutes(e.end_time) - parseTimeToMinutes(e.start_time)), 0),
  }));
  const sorted = [...busyScore].sort((a, b) => b.m - a.m);
  const avoidDays = sorted.slice(0, 2).filter(x => x.m > 0).map(x => x.d);

  const bestLearningWindows: string[] = [];
  for (const d of WEEKDAYS) {
    if (avoidDays.includes(d)) continue;
    if (freeEveningSlots(events, d) > 0) {
      bestLearningWindows.push(`${d} · 5–7 PM window`);
    }
  }
  if (bestLearningWindows.length > 3) bestLearningWindows.length = 3;

  return {
    heavyAcademicDays,
    freeEvenings,
    bestLearningWindows: bestLearningWindows.length
      ? bestLearningWindows
      : ["Add your schedule to surface personalized windows"],
    avoidDays: avoidDays.length ? avoidDays : [],
  };
}
