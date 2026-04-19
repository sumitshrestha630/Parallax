"use client";

import React from "react";
import type { WeeklyPlan } from "@/types/balance";
import { HEADING_STYLE, CARD_BG, CARD_BORDER } from "@/components/balance/balance-tokens";

interface WeeklyPlanCardProps {
  plan: WeeklyPlan;
}

export function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
  const rows = [
    { label: "Short lessons", n: plan.shortLessons, sub: "~15 min drills", color: "#60A5FA" },
    { label: "Practice tasks", n: plan.practiceTasks, sub: "hands-on reps", color: "#6ED640" },
    { label: "Project blocks", n: plan.projects, sub: "deep work", color: "#FBBF24" },
  ];

  return (
    <div style={{ background: CARD_BG, border: `2px solid ${CARD_BORDER}` }}>
      <div className="px-4 py-3" style={{ borderBottom: `2px solid ${CARD_BORDER}`, background: "#04080e" }}>
        <h2 style={{ ...HEADING_STYLE, fontSize: "11px" }}>Your Weekly Plan</h2>
        <p className="text-xs mt-1" style={{ color: "#64748b" }}>
          Suggested counts based on your availability — tune as you go.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: CARD_BORDER }}>
        {rows.map(r => (
          <div key={r.label} className="p-5" style={{ background: "#060c18" }}>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>{r.label}</p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: r.color, lineHeight: 1 }}>{r.n}</p>
            <p className="text-xs mt-2" style={{ color: "#475569" }}>{r.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
