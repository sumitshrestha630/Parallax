"use client";

import React from "react";
import type { BalanceInsight } from "@/types/balance";
import { HEADING_STYLE, LABEL_STYLE, CARD_BG, CARD_BORDER } from "@/components/balance/balance-tokens";

interface InsightsPanelProps {
  insight: BalanceInsight;
}

export function InsightsPanel({ insight }: InsightsPanelProps) {
  return (
    <div
      className="flex flex-col h-full min-h-[280px]"
      style={{ background: CARD_BG, border: `2px solid ${CARD_BORDER}` }}
    >
      <div className="px-4 py-3" style={{ borderBottom: `2px solid ${CARD_BORDER}`, background: "#04080e" }}>
        <span style={{ ...HEADING_STYLE, fontSize: "10px" }}>Insights</span>
      </div>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
        <div>
          <p style={{ ...LABEL_STYLE, color: "#64748b", fontSize: "10px", marginBottom: "6px" }}>ACADEMIC LOAD</p>
          <p className="text-sm" style={{ color: "#cbd5e1" }}>
            <strong style={{ color: "#FBBF24" }}>{insight.heavyAcademicDays}</strong> heavy school days (3h+ class)
          </p>
        </div>
        <div>
          <p style={{ ...LABEL_STYLE, color: "#64748b", fontSize: "10px", marginBottom: "6px" }}>FREE EVENINGS</p>
          <p className="text-sm" style={{ color: "#cbd5e1" }}>
            <strong style={{ color: "#6ED640" }}>{insight.freeEvenings}</strong> open evening hours (weekdays)
          </p>
        </div>
        <div>
          <p style={{ ...LABEL_STYLE, color: "#64748b", fontSize: "10px", marginBottom: "6px" }}>BEST WINDOWS</p>
          <ul className="space-y-1">
            {insight.bestLearningWindows.map((w, i) => (
              <li key={i} className="text-xs" style={{ color: "#94a3b8" }}>• {w}</li>
            ))}
          </ul>
        </div>
        {insight.avoidDays.length > 0 && (
          <div>
            <p style={{ ...LABEL_STYLE, color: "#64748b", fontSize: "10px", marginBottom: "6px" }}>LIGHTEN UP ON</p>
            <p className="text-xs" style={{ color: "#f87171" }}>
              {insight.avoidDays.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
