"use client";

import React from "react";
import type { ScheduleEvent, ScheduleEventType } from "@/types/balance";
import { PF, PIXEL_BTN_STYLE, HEADING_STYLE, CARD_BG, CARD_BORDER } from "@/components/balance/balance-tokens";

interface ScheduleSetupCardProps {
  events:       ScheduleEvent[];
  onAdd:        (type: ScheduleEventType) => void;
  onEditEvent:  (e: ScheduleEvent) => void;
}

export function ScheduleSetupCard({ events, onAdd, onEditEvent }: ScheduleSetupCardProps) {
  return (
    <div style={{ background: CARD_BG, border: `2px solid ${CARD_BORDER}` }}>
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderBottom: `2px solid ${CARD_BORDER}` }}>
        <div>
          <h2 style={{ ...HEADING_STYLE, fontSize: "11px" }}>Your Weekly Schedule</h2>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Add classes, work shifts, or custom blocks — your calendar updates instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onAdd("class")} style={PIXEL_BTN_STYLE()}>
            + Add Class
          </button>
          <button type="button" onClick={() => onAdd("work")} style={PIXEL_BTN_STYLE("#122040", "#1e3a6a", "#06111e")}>
            <span style={{ color: "#6ED640" }}>+ Add Work</span>
          </button>
          <button type="button" onClick={() => onAdd("custom")} style={PIXEL_BTN_STYLE("#122040", "#1e3a6a", "#06111e")}>
            <span style={{ color: "#6ED640" }}>+ Custom Event</span>
          </button>
        </div>
      </div>
      {events.length > 0 && (
        <ul className="px-4 py-3 flex flex-wrap gap-2">
          {events.map(e => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onEditEvent(e)}
                className="text-left transition-opacity hover:opacity-90"
                style={{
                  fontFamily: PF, fontSize: "6px",
                  background: "#0d1628",
                  border: `2px solid #1a2744`,
                  color: "#94a3b8",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                <span style={{ color: "#cbd5e1" }}>{e.title}</span>
                <span style={{ color: "#475569" }}> · {e.day} {e.start_time}–{e.end_time}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
