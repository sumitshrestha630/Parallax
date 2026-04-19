"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  createScheduleViaApi,
  deleteScheduleViaApi,
  fetchScheduleViaApi,
  updateScheduleViaApi,
} from "@/lib/balance/schedule-api-client";
import type {
  ScheduleEvent,
  ScheduleEventType,
  ScheduleIntensity,
  Weekday,
} from "@/types/balance";
import { computeBalanceInsight } from "@/lib/balance/insights";
import { computeRecommendedSlots } from "@/lib/balance/recommendations";
import { computeWeeklyPlan } from "@/lib/balance/weekly-plan";
import { buildCalendarGrid } from "@/lib/balance/grid";
import { HEADING_STYLE, PF } from "@/components/balance/balance-tokens";
import { ScheduleSetupCard } from "@/components/balance/ScheduleSetupCard";
import { WeeklyCalendar } from "@/components/balance/WeeklyCalendar";
import { InsightsPanel } from "@/components/balance/InsightsPanel";
import { WeeklyPlanCard } from "@/components/balance/WeeklyPlanCard";
import { EventEditorModal } from "@/components/balance/EventEditorModal";

interface BalanceViewProps {
  user: User;
}

export function BalanceView({ user }: BalanceViewProps) {
  const [events, setEvents]     = useState<ScheduleEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState<string | null>(null);

  const [modalOpen, setModalOpen]       = useState(false);
  const [modalMode, setModalMode]       = useState<"create" | "edit">("create");
  const [defaultType, setDefaultType]   = useState<ScheduleEventType>("class");
  const [editing, setEditing]         = useState<ScheduleEvent | null>(null);

  const refresh = useCallback(async () => {
    setLoadErr(null);
    const data = await fetchScheduleViaApi();
    setEvents(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchScheduleViaApi();
        if (!cancelled) {
          setEvents(data);
          setLoadErr(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setLoadErr(e instanceof Error ? e.message : "Failed to load schedule");
        }
      } finally {
        if (!cancelled) setLoading(false);
        }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  const insight = useMemo(() => computeBalanceInsight(events), [events]);
  const recommended = useMemo(() => computeRecommendedSlots(events, 8), [events]);
  const plan = useMemo(() => computeWeeklyPlan(insight), [insight]);
  const cellMap = useMemo(
    () => buildCalendarGrid(events, recommended),
    [events, recommended]
  );

  const openCreate = (type: ScheduleEventType) => {
    setModalMode("create");
    setDefaultType(type);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (e: ScheduleEvent) => {
    setModalMode("edit");
    setEditing(e);
    setDefaultType(e.type);
    setModalOpen(true);
  };

  const handleSave = async (payload: {
    title: string;
    type: ScheduleEventType;
    day: Weekday;
    start_time: string;
    end_time: string;
    intensity: ScheduleIntensity;
  }) => {
    if (modalMode === "create") {
      await createScheduleViaApi(payload);
    } else if (modalMode === "edit" && editing) {
      await updateScheduleViaApi(editing.id, payload);
    } else {
      throw new Error("Nothing to save — reopen the event and try again.");
    }
    await refresh();
  };

  const handleDelete = async () => {
    if (!editing) return;
    await deleteScheduleViaApi(editing.id);
    await refresh();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden" style={{ background: "#080e1a" }}>
      <header className="flex-shrink-0 px-6 py-4" style={{ borderBottom: "2px solid #1a2744" }}>
        <h1 style={{ ...HEADING_STYLE, fontSize: "14px" }}>Balance</h1>
        <p className="text-xs mt-2" style={{ color: "#64748b" }}>
          Plan your week, see where you have room to learn, and get lightweight recommendations.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-4">
        {loadErr && (
          <div
            className="px-4 py-3 text-sm"
            style={{ background: "#3b1220", border: "2px solid #7f1d1d", color: "#fecaca" }}
          >
            {loadErr}
            <span className="block mt-1" style={{ fontFamily: PF, fontSize: "10px", color: "#94a3b8" }}>
              Run migration `002_user_schedule_events.sql` in Supabase if this table is missing.
            </span>
          </div>
        )}

        {loading && !events.length && !loadErr && (
          <p className="text-sm" style={{ color: "#64748b" }}>Loading your schedule…</p>
        )}

        <ScheduleSetupCard events={events} onAdd={openCreate} onEditEvent={openEdit} />

        <div className="flex flex-col xl:flex-row gap-4 min-h-[420px] flex-1">
          <div className="flex-1 min-w-0 min-h-[400px] flex flex-col">
            <WeeklyCalendar events={events} cellMap={cellMap} onEditEvent={openEdit} />
          </div>
          <div className="w-full xl:w-[300px] flex-shrink-0 min-h-[280px]">
            <InsightsPanel insight={insight} />
          </div>
        </div>

        <WeeklyPlanCard plan={plan} />
      </div>

      <EventEditorModal
        open={modalOpen}
        mode={modalMode}
        defaultType={defaultType}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        onDelete={modalMode === "edit" ? handleDelete : undefined}
      />
    </div>
  );
}
