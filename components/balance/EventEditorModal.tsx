"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScheduleEvent, ScheduleEventType, ScheduleIntensity, Weekday } from "@/types/balance";
import { WEEKDAYS } from "@/lib/balance/constants";
import { PF, PIXEL_BTN_STYLE, CARD_BG, CARD_BORDER } from "@/components/balance/balance-tokens";

interface EventEditorModalProps {
  open:       boolean;
  mode:       "create" | "edit";
  defaultType: ScheduleEventType;
  initial?:   ScheduleEvent | null;
  onClose:    () => void;
  onSave:     (payload: {
    title: string;
    type: ScheduleEventType;
    day: Weekday;
    start_time: string;
    end_time: string;
    intensity: ScheduleIntensity;
  }) => Promise<void>;
  onDelete?:  () => Promise<void>;
}

const TYPES: ScheduleEventType[] = ["class", "work", "custom"];

function defaultIntensityForType(t: ScheduleEventType): ScheduleIntensity {
  return t === "custom" ? "medium" : "busy";
}

export function EventEditorModal({
  open,
  mode,
  defaultType,
  initial,
  onClose,
  onSave,
  onDelete,
}: EventEditorModalProps) {
  const [title, setTitle]       = useState("");
  const [type, setType]         = useState<ScheduleEventType>(defaultType);
  const [day, setDay]           = useState<Weekday>("Mon");
  const [start, setStart]       = useState("09:00");
  const [end, setEnd]           = useState("10:00");
  const [intensity, setIntensity] = useState<ScheduleIntensity>("busy");
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (mode === "edit" && initial) {
      setTitle(initial.title);
      setType(initial.type);
      setDay(initial.day);
      setStart(initial.start_time);
      setEnd(initial.end_time);
      setIntensity(initial.intensity);
    } else {
      setTitle("");
      setType(defaultType);
      setDay("Mon");
      setStart("09:00");
      setEnd("10:00");
      setIntensity(defaultIntensityForType(defaultType));
    }
  }, [open, mode, initial, defaultType]);

  useEffect(() => {
    setIntensity(defaultIntensityForType(type));
  }, [type]);

  const submit = async () => {
    if (!title.trim()) {
      setErr("Add a title.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSave({
        title: title.trim(),
        type,
        day,
        start_time: start,
        end_time: end,
        intensity,
      });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(2,5,14,0.88)",
            backdropFilter: "blur(8px)",
            zIndex: 220,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: CARD_BG,
              border: `2px solid ${CARD_BORDER}`,
              width: "100%", maxWidth: "420px",
              padding: "20px",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: PF, fontSize: "10px", color: "#e2e8f0" }}>
                {mode === "create" ? "Add event" : "Edit event"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                style={{
                  fontFamily: PF, fontSize: "8px", color: "#64748b",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <label className="block mb-3">
              <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>TITLE</span>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2"
                style={{
                  background: "#0d1a2e", border: "2px solid #1e3858", color: "#e2e8f0",
                  fontSize: "13px", outline: "none",
                }}
                placeholder="e.g. CS 101 Lecture"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>TYPE</span>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as ScheduleEventType)}
                  className="mt-1 w-full px-2 py-2"
                  style={{
                    background: "#0d1a2e", border: "2px solid #1e3858", color: "#e2e8f0",
                    fontSize: "12px",
                  }}
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>DAY</span>
                <select
                  value={day}
                  onChange={e => setDay(e.target.value as Weekday)}
                  className="mt-1 w-full px-2 py-2"
                  style={{
                    background: "#0d1a2e", border: "2px solid #1e3858", color: "#e2e8f0",
                    fontSize: "12px",
                  }}
                >
                  {WEEKDAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>START</span>
                <input
                  type="time"
                  value={start}
                  onChange={e => setStart(e.target.value)}
                  className="mt-1 w-full px-2 py-2"
                  style={{
                    background: "#0d1a2e", border: "2px solid #1e3858", color: "#e2e8f0",
                  }}
                />
              </label>
              <label className="block">
                <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>END</span>
                <input
                  type="time"
                  value={end}
                  onChange={e => setEnd(e.target.value)}
                  className="mt-1 w-full px-2 py-2"
                  style={{
                    background: "#0d1a2e", border: "2px solid #1e3858", color: "#e2e8f0",
                  }}
                />
              </label>
            </div>

            <label className="block mb-4">
              <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>LOAD</span>
              <select
                value={intensity}
                onChange={e => setIntensity(e.target.value as ScheduleIntensity)}
                className="mt-1 w-full px-2 py-2"
                style={{
                  background: "#0d1a2e", border: "2px solid #1e3858", color: "#e2e8f0",
                  fontSize: "12px",
                }}
              >
                <option value="busy">Busy (heavy)</option>
                <option value="medium">Medium</option>
              </select>
            </label>

            {err && (
              <p style={{ color: "#f87171", fontSize: "12px", marginBottom: "12px" }}>{err}</p>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
              {mode === "edit" && onDelete && (
                <button
                  type="button"
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await onDelete();
                      onClose();
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  style={PIXEL_BTN_STYLE("#3b1220", "#7f1d1d", "#450a0a")}
                >
                  Delete
                </button>
              )}
              <button type="button" onClick={onClose} disabled={saving} style={PIXEL_BTN_STYLE("#122040", "#1e3a6a", "#06111e")}>
                <span style={{ color: "#6ED640" }}>Cancel</span>
              </button>
              <button type="button" onClick={submit} disabled={saving} style={PIXEL_BTN_STYLE()}>
                {saving ? "…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
