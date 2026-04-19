"use client";

import React, { useMemo } from "react";
import type { CalendarCellMeta } from "@/lib/balance/grid";
import type { ScheduleEvent } from "@/types/balance";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, WEEKDAYS } from "@/lib/balance/constants";
import { formatHourRow } from "@/lib/balance/time";
import { HEADING_STYLE, LABEL_STYLE, CARD_BG, CARD_BORDER, PF } from "@/components/balance/balance-tokens";
import { layoutEventInColumn, getTodayWeekday } from "@/lib/balance/calendar-layout";

const CELL: Record<string, React.CSSProperties> = {
  busy: {
    background: "rgba(59,18,32,0.45)",
    borderBottom: "1px solid #1a2744",
    transition: "background 0.2s ease",
  },
  medium: {
    background: "rgba(58,48,16,0.45)",
    borderBottom: "1px solid #1a2744",
    transition: "background 0.2s ease",
  },
  free: {
    background: "rgba(13,31,20,0.35)",
    borderBottom: "1px solid #1a2744",
    transition: "background 0.2s ease",
  },
  recommended: {
    background: "rgba(15,41,24,0.55)",
    borderBottom: "1px solid #1a2744",
    boxShadow: "inset 0 0 0 1px rgba(110,214,64,0.2)",
    transition: "background 0.2s ease, box-shadow 0.2s ease",
  },
};

const TYPE_ACCENT: Record<ScheduleEvent["type"], string> = {
  class:  "#60A5FA",
  work:   "#F97316",
  custom: "#A78BFA",
};

function eventCardStyle(ev: ScheduleEvent): React.CSSProperties {
  const accent = TYPE_ACCENT[ev.type];
  const base =
    ev.intensity === "busy"
      ? { bg: "#3b1220", border: "#7f1d1d", text: "#fecaca" }
      : { bg: "#3a3010", border: "#a16207", text: "#fef3c7" };
  return {
    position: "absolute",
    left: 3,
    right: 3,
    zIndex: 4,
    background: base.bg,
    border: `1px solid ${base.border}`,
    borderLeft: `4px solid ${accent}`,
    borderRadius: 2,
    padding: "4px 6px",
    overflow: "hidden",
    cursor: "pointer",
    textAlign: "left" as const,
    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    color: base.text,
  };
}

const TYPE_ICON: Record<ScheduleEvent["type"], string> = {
  class: "📚",
  work: "💼",
  custom: "✨",
};

interface WeeklyCalendarProps {
  events:    ScheduleEvent[];
  cellMap:   Map<string, CalendarCellMeta>;
  onEditEvent: (e: ScheduleEvent) => void;
}

export function WeeklyCalendar({ events, cellMap, onEditEvent }: WeeklyCalendarProps) {
  const hours: number[] = [];
  for (let h = CALENDAR_START_HOUR; h < CALENDAR_END_HOUR; h++) hours.push(h);

  const ROW_H  = 44;
  const NUM_H  = CALENDAR_END_HOUR - CALENDAR_START_HOUR;
  const COL_H  = NUM_H * ROW_H;
  const today  = useMemo(() => getTodayWeekday(), []);

  return (
    <div
      className="rounded-none overflow-hidden flex flex-col min-h-0 flex-1"
      style={{ background: CARD_BG, border: `2px solid ${CARD_BORDER}` }}
    >
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `2px solid ${CARD_BORDER}`, background: "#04080e" }}>
        <span style={{ ...HEADING_STYLE, fontSize: "10px" }}>Weekly schedule</span>
        <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
          Full week · {formatHourRow(CALENDAR_START_HOUR)}–{formatHourRow(CALENDAR_END_HOUR - 1)} — saved classes, work, and
          custom blocks appear on the grid. Click a block to edit.
        </p>
      </div>

      <div className="overflow-auto flex-1 p-2 md:p-3">
        <div
          className="grid w-full min-w-[720px]"
          style={{
            gridTemplateColumns: `80px repeat(7, minmax(0, 1fr))`,
            gap: "0",
            alignItems: "stretch",
          }}
        >
          {/* corner */}
          <div className="sticky left-0 z-20" style={{ background: "#04080e", borderBottom: `2px solid ${CARD_BORDER}` }} />
          {WEEKDAYS.map(d => {
            const isToday = d === today;
            return (
              <div
                key={d}
                className="text-center py-2 sticky top-0 z-10"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "7px",
                  color: isToday ? "#6ED640" : "#94a3b8",
                  background: isToday ? "rgba(110,214,64,0.08)" : "#04080e",
                  borderBottom: `2px solid ${CARD_BORDER}`,
                  borderLeft: `1px solid ${CARD_BORDER}`,
                  boxShadow: isToday ? "inset 0 -2px 0 rgba(110,214,64,0.35)" : undefined,
                }}
              >
                {d}
                {isToday && <span className="block text-[6px] mt-1" style={{ color: "#475569" }}>today</span>}
              </div>
            );
          })}

          {/* Time labels + day columns */}
          <div className="flex flex-col sticky left-0 z-10" style={{ background: "#080e1a" }}>
            {hours.map(hour => (
              <div
                key={hour}
                className="flex items-start justify-end pr-2 box-border"
                style={{ height: ROW_H, fontSize: "11px", color: "#64748b", borderTop: "1px solid #1a2744" }}
              >
                {formatHourRow(hour)}
              </div>
            ))}
          </div>

          {WEEKDAYS.map(day => {
            const isToday = day === today;
            return (
              <div
                key={day}
                className="relative box-border"
                style={{
                  height: COL_H,
                  borderLeft: `1px solid ${CARD_BORDER}`,
                  background: isToday ? "rgba(110,214,64,0.04)" : undefined,
                }}
              >
                {hours.map(hour => {
                  const key  = `${day}-${hour}`;
                  const meta = cellMap.get(key) ?? { kind: "free" as const, tooltip: "" };
                  const st   = CELL[meta.kind] ?? CELL.free;
                  return (
                    <div
                      key={hour}
                      title={meta.tooltip || meta.kind}
                      className="box-border w-full"
                      style={{ ...st, height: ROW_H, width: "100%" }}
                    />
                  );
                })}

                {events
                  .filter(e => e.day === day)
                  .map(ev => {
                    const layout = layoutEventInColumn(ev, day, COL_H);
                    if (!layout) return null;
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        title={`${ev.title} · ${ev.start_time}–${ev.end_time} · ${ev.type}`}
                        onClick={() => onEditEvent(ev)}
                        style={{
                          ...eventCardStyle(ev),
                          top: layout.topPx,
                          height: layout.heightPx,
                        }}
                        className="hover:brightness-110 active:scale-[0.99]"
                      >
                        <span style={{ fontFamily: PF, fontSize: "5px", opacity: 0.85, display: "block" }}>
                          {TYPE_ICON[ev.type]} {ev.type.toUpperCase()}
                        </span>
                        <span
                          className="block truncate leading-tight"
                          style={{ fontFamily: PF, fontSize: "6px", marginTop: "3px" }}
                        >
                          {ev.title}
                        </span>
                        <span style={{ fontFamily: PF, fontSize: "5px", opacity: 0.75, marginTop: "2px", display: "block" }}>
                          {ev.start_time.slice(0, 5)}–{ev.end_time.slice(0, 5)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-4 px-4 py-3 flex-shrink-0"
        style={{ borderTop: `2px solid ${CARD_BORDER}`, background: "#030610" }}
      >
        <span style={{ ...LABEL_STYLE, color: "#64748b", fontSize: "6px" }}>Legend</span>
        {(
          [
            ["busy", "Busy / class+work", CELL.busy.background as string],
            ["medium", "Medium load", CELL.medium.background as string],
            ["free", "Free", CELL.free.background as string],
            ["recommended", "Suggested study", "#0f2918"],
          ] as const
        ).map(([k, lab, col]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: col, border: `1px solid ${CARD_BORDER}` }} />
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{lab}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
