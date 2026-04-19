"use client";

import React, { useMemo } from "react";
import type { TaskWithUserState } from "@/types/dashboard";

const PF = "'Press Start 2P', monospace";

function splitLearnContent(description: string | null): { prose: string; code: string | null } {
  if (!description?.trim()) return { prose: "", code: null };
  const m = description.match(/```(?:[\w]*)?\s*([\s\S]*?)```/);
  if (m) {
    return {
      prose: description.replace(/```(?:[\w]*)?\s*[\s\S]*?```/, "").trim(),
      code: m[1]?.trim() ?? null,
    };
  }
  return { prose: description.trim(), code: null };
}

type TaskQuestDetailProps = {
  row:             TaskWithUserState;
  /** Skill tree node label — shown as “Learn: …” */
  topicLabel?:     string;
  onBack:          () => void;
  onComplete:      () => void | Promise<void>;
  onNextTask?:     () => void;
  nextTaskTitle?:  string | null;
};

export function TaskQuestDetail({
  row,
  topicLabel,
  onBack,
  onComplete,
  onNextTask,
  nextTaskTitle,
}: TaskQuestDetailProps) {
  const { task, userTask } = row;
  const learn = useMemo(() => splitLearnContent(task.description), [task.description]);
  const pct = Math.max(0, Math.min(100, userTask.progress ?? 0));

  const panelStyle: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(8,14,26,0.96) 100%)",
    border: "3px double rgba(180,150,70,0.45)",
    boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.15), 0 12px 40px rgba(0,0,0,0.45)",
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden rounded-sm"
      style={{
        background: `
          radial-gradient(ellipse 120% 80% at 50% -20%, rgba(34,197,94,0.08), transparent 50%),
          linear-gradient(180deg, #0a1220 0%, #080e1a 35%, #050a14 100%)
        `,
        border: "2px solid rgba(251,191,36,0.25)",
      }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{
          borderBottom: "2px solid rgba(251,191,36,0.2)",
          background: "rgba(4,8,16,0.85)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            fontFamily: PF,
            fontSize: "7px",
            color: "#64748b",
            background: "none",
            border: "2px solid #1a2744",
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: "18px", lineHeight: 1 }}>🌱</span>
        <h1 style={{ fontFamily: PF, fontSize: "11px", color: "#e2e8f0", flex: 1, minWidth: 0 }}>
          {task.title}
        </h1>
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
        {/* Learn column */}
        <section className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6" style={{ borderRight: "1px solid rgba(30,40,58,0.8)" }}>
          <div style={panelStyle} className="p-5 rounded-sm">
            <p style={{ fontFamily: PF, fontSize: "7px", color: "#FBBF24", marginBottom: "12px" }}>
              📜 Learn{topicLabel ? `: ${topicLabel}` : ""}
            </p>
            {learn.prose && (
              <div className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
                {learn.prose.split("\n").map((line, i) => (
                  <p key={i} className={line.startsWith("•") || line.startsWith("-") ? "mt-2" : "mb-2"}>
                    {line}
                  </p>
                ))}
              </div>
            )}
            {learn.code && (
              <pre
                className="mt-4 p-4 text-xs overflow-x-auto rounded-sm"
                style={{
                  background: "#030712",
                  border: "1px solid #1e293b",
                  color: "#a5f3fc",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {learn.code}
              </pre>
            )}
            {!learn.prose && !learn.code && (
              <p className="text-sm" style={{ color: "#64748b" }}>
                Work through your challenges below. Mark complete when you’ve finished this task.
              </p>
            )}
          </div>
        </section>

        {/* Progress column */}
        <aside className="flex-shrink-0 w-full lg:w-[300px] overflow-y-auto p-4 lg:p-6" style={{ background: "rgba(3,6,14,0.5)" }}>
          <div style={panelStyle} className="p-5 space-y-5 rounded-sm">
            <p style={{ fontFamily: PF, fontSize: "7px", color: "#94a3b8" }}>📊 Progress panel</p>

            <div>
              <div className="flex justify-between mb-2">
                <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>Progress</span>
                <span style={{ fontFamily: PF, fontSize: "6px", color: "#6ED640" }}>{pct}%</span>
              </div>
              <div className="h-3 rounded-sm overflow-hidden" style={{ background: "#162238", border: "1px solid #1e3858" }}>
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#3A9018,#6ED640)" }} />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span style={{ fontSize: "16px" }}>⏱</span>
              <div>
                <p style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>TIME</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  ~{task.estimated_minutes ?? "—"} minutes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span style={{ fontSize: "16px" }}>🌿</span>
              <div>
                <p style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>WHY THIS MATTERS</p>
                <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                  Every skill node you finish unlocks more of your career map — ship small wins often.
                </p>
              </div>
            </div>

            {nextTaskTitle && (
              <div className="flex items-start gap-2">
                <span style={{ fontSize: "16px" }}>🎯</span>
                <div>
                  <p style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>NEXT UNLOCK</p>
                  <p className="text-sm" style={{ color: "#cbd5e1" }}>{nextTaskTitle}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Actions */}
      <footer
        className="flex-shrink-0 flex flex-wrap gap-3 px-4 py-4"
        style={{
          borderTop: "2px solid rgba(251,191,36,0.2)",
          background: "rgba(4,8,16,0.9)",
        }}
      >
        <button
          type="button"
          onClick={() => void onComplete()}
          disabled={userTask.status === "completed"}
          style={{
            fontFamily: PF,
            fontSize: "9px",
            flex: "1 1 200px",
            padding: "14px 20px",
            background: userTask.status === "completed" ? "#1a2e18" : "#6ED640",
            border: `3px solid ${userTask.status === "completed" ? "#3A9018" : "#3A9018"}`,
            boxShadow: userTask.status === "completed" ? "none" : "0 5px 0 #1E6010, 0 7px 0 rgba(0,0,0,0.35)",
            color: userTask.status === "completed" ? "#6ED640" : "#0a1a06",
            cursor: userTask.status === "completed" ? "default" : "pointer",
          }}
        >
          {userTask.status === "completed" ? "✓ Completed" : "✓ Mark as Complete"}
        </button>
        <button
          type="button"
          onClick={onNextTask}
          disabled={!onNextTask}
          style={{
            fontFamily: PF,
            fontSize: "9px",
            flex: "1 1 180px",
            padding: "14px 20px",
            background: "#122040",
            border: "3px solid #b8860b",
            boxShadow: onNextTask ? "0 5px 0 #6b4f0a, 0 7px 0 rgba(0,0,0,0.35)" : "none",
            color: "#fbbf24",
            cursor: onNextTask ? "pointer" : "not-allowed",
            opacity: onNextTask ? 1 : 0.45,
          }}
        >
          Next task →
        </button>
      </footer>
    </div>
  );
}
