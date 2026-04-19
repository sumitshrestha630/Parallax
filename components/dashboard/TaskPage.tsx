"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskWithUserState, UserTaskStatus } from "@/types/dashboard";
import { fetchTasks, startTask, completeTask, updateTaskProgress } from "@/lib/dashboard/tasks-api-client";
import { TaskQuestDetail } from "@/components/dashboard/TaskQuestDetail";

const PF = "'Press Start 2P', monospace";

const CARD: React.CSSProperties = { background: "#060c18", border: "2px solid #1a2744" };

const BTN = (
  bg = "#6ED640",
  border = "#3A9018",
  shadow = "#1E6010"
): React.CSSProperties => ({
  fontFamily: PF,
  fontSize: "9px",
  background: bg,
  border: `3px solid ${border}`,
  boxShadow: `0 4px 0 ${shadow}, 0 6px 0 rgba(0,0,0,0.35)`,
  padding: "8px 12px",
  color: bg === "#6ED640" ? "#0a1a06" : "#6ED640",
  cursor: "pointer",
});

function badge(text: string, color: string) {
  return (
    <span
      style={{
        fontFamily: PF,
        fontSize: "6px",
        padding: "2px 6px",
        border: `1px solid ${color}55`,
        background: `${color}22`,
        color,
      }}
    >
      {text}
    </span>
  );
}

function statusColor(s: UserTaskStatus) {
  if (s === "completed") return "#6ED640";
  if (s === "in_progress") return "#FBBF24";
  if (s === "available") return "#60A5FA";
  return "#64748b";
}

/** Prefer tasks you can still work on; otherwise first by catalog order. */
function pickPreferredTask(rows: TaskWithUserState[]): TaskWithUserState | undefined {
  const rank = (s: UserTaskStatus) =>
    ({ available: 0, in_progress: 1, completed: 2, locked: 3 }[s] ?? 99);
  const sorted = [...rows].sort((a, b) => {
    const d = rank(a.userTask.status) - rank(b.userTask.status);
    if (d !== 0) return d;
    return (a.task.order_index ?? 0) - (b.task.order_index ?? 0);
  });
  return sorted[0];
}

function findNextTaskInLane(rows: TaskWithUserState[], current: TaskWithUserState): TaskWithUserState | undefined {
  const lane = rows
    .filter(r => r.task.skill_key === current.task.skill_key)
    .sort((a, b) => (a.task.order_index ?? 0) - (b.task.order_index ?? 0));
  const i = lane.findIndex(r => r.task.task_key === current.task.task_key);
  return i >= 0 ? lane[i + 1] : undefined;
}

export type SkillTreeTaskFocus = {
  skillKey: string;
  nodeId: string;
  nodeLabel: string;
};

interface TaskPageProps {
  onSkillsUpdated?: () => void | Promise<void>;
  /** When set (e.g. from Skill Tree “Continue to Tasks”), opens the quest-style detail for that skill lane. */
  skillTreeFocus?: SkillTreeTaskFocus | null;
  onConsumedSkillTreeFocus?: () => void;
}

export function TaskPage({
  onSkillsUpdated,
  skillTreeFocus,
  onConsumedSkillTreeFocus,
}: TaskPageProps) {
  const router = useRouter();
  const [rows, setRows] = useState<TaskWithUserState[]>([]);
  const [learningSkillKeys, setLearningSkillKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [mode, setMode] = useState<"learning" | "all">("learning");
  const [status, setStatus] = useState<UserTaskStatus | "all">("all");
  const [difficulty, setDifficulty] = useState<string | "all">("all");

  const [questRow, setQuestRow] = useState<TaskWithUserState | null>(null);
  const [questTopicLabel, setQuestTopicLabel] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetchTasks({
        mode,
        status: status === "all" ? undefined : status,
        difficulty: difficulty === "all" ? undefined : difficulty,
        includeResources: true,
      });
      setRows(res.rows);
      setLearningSkillKeys(res.learningSkillKeys ?? []);
      return res.rows;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load tasks");
      return [];
    } finally {
      setLoading(false);
    }
  }, [mode, status, difficulty]);

  useEffect(() => {
    /** Skill-tree open quest loads its own rows — don’t overwrite with the default filtered fetch. */
    if (skillTreeFocus || questRow) return;
    void refresh();
  }, [refresh, skillTreeFocus, questRow]);

  /** Skill Tree hand-off: load that skill lane and open quest view on the best task match. */
  useEffect(() => {
    if (!skillTreeFocus) return;
    const focus = skillTreeFocus;
    let cancelled = false;
    let openedQuest = false;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const loaded = await fetchTasks({
          mode: "all",
          skillKey: focus.skillKey,
          includeResources: true,
        });
        if (cancelled) return;
        setRows(loaded.rows);
        const pick = pickPreferredTask(loaded.rows);
        if (pick) {
          openedQuest = true;
          setQuestRow(pick);
          setQuestTopicLabel(focus.nodeLabel);
        } else {
          setQuestRow(null);
          setQuestTopicLabel(undefined);
          setErr(
            `No tasks assigned for “${focus.skillKey}” yet. Switch VIEW to All or run the DB backfill migration if you’re on an older account.`
          );
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Could not load tasks for this skill.");
          setQuestRow(null);
          setQuestTopicLabel(undefined);
        }
      } finally {
        if (!cancelled) {
          onConsumedSkillTreeFocus?.();
          if (openedQuest) {
            setLoading(false);
          } else {
            /** Loads the default filtered list and clears the spinner */
            void refresh();
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot hand-off
  }, [skillTreeFocus, refresh]);

  const bySkill = useMemo(() => {
    const map = new Map<string, TaskWithUserState[]>();
    for (const r of rows) {
      const k = r.task.skill_key;
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  const nextInLane = questRow ? findNextTaskInLane(rows, questRow) : undefined;

  const runComplete = async (taskKey: string) => {
    await completeTask(taskKey);
    const nextRows = await fetchTasks({
      mode,
      status: status === "all" ? undefined : status,
      difficulty: difficulty === "all" ? undefined : difficulty,
      includeResources: true,
    });
    setRows(nextRows.rows);
    setLearningSkillKeys(nextRows.learningSkillKeys ?? []);
    const updated = nextRows.rows.find(r => r.task.task_key === taskKey);
    if (updated && questRow && questRow.task.task_key === taskKey) {
      setQuestRow(updated);
    }
    if (onSkillsUpdated) await onSkillsUpdated();
    else router.refresh();
  };

  if (questRow) {
    return (
      <TaskQuestDetail
        row={questRow}
        topicLabel={questTopicLabel}
        onBack={() => {
          setQuestRow(null);
          setQuestTopicLabel(undefined);
          void refresh();
        }}
        onComplete={() => runComplete(questRow.task.task_key)}
        onNextTask={
          nextInLane
            ? () => {
                setQuestRow(nextInLane);
              }
            : undefined
        }
        nextTaskTitle={nextInLane?.task.title ?? null}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden" style={{ background: "#080e1a" }}>
      <header className="flex-shrink-0 px-6 py-4" style={{ borderBottom: "2px solid #1a2744" }}>
        <h1 style={{ fontFamily: PF, fontSize: "14px", color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
          Tasks
        </h1>
        <p className="text-xs mt-2" style={{ color: "#64748b" }}>
          <strong className="text-slate-400">Learning</strong> mode uses your Skill Tree: active nodes (▶) map to practice
          skills (frontend, backend, …). If you see nothing, switch to <strong>All</strong> or complete a node on the Skill
          Tree tab so it becomes active.
        </p>
        {mode === "learning" && learningSkillKeys.length > 0 && (
          <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
            Focus skills: {learningSkillKeys.join(", ")}
          </p>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center" style={{ ...CARD, padding: "12px" }}>
          <span style={{ fontFamily: PF, fontSize: "7px", color: "#94a3b8" }}>VIEW</span>
          <button type="button" onClick={() => setMode("learning")} style={BTN(mode === "learning" ? "#6ED640" : "#122040", "#1e3a6a", "#06111e")}>
            Learning
          </button>
          <button type="button" onClick={() => setMode("all")} style={BTN(mode === "all" ? "#6ED640" : "#122040", "#1e3a6a", "#06111e")}>
            All
          </button>

          <span className="ml-2" style={{ fontFamily: PF, fontSize: "7px", color: "#94a3b8" }}>STATUS</span>
          {(["all", "available", "in_progress", "completed"] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              style={BTN(status === s ? "#6ED640" : "#0d1a2e", "#1e3858", "#06111e")}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}

          <span className="ml-2" style={{ fontFamily: PF, fontSize: "7px", color: "#94a3b8" }}>DIFFICULTY</span>
          {(["all", "beginner", "intermediate", "advanced"] as const).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              style={BTN(difficulty === d ? "#6ED640" : "#0d1a2e", "#1e3858", "#06111e")}
            >
              {d === "all" ? "Any" : d}
            </button>
          ))}
        </div>

        {err && (
          <div className="px-4 py-3 text-sm" style={{ background: "#3b1220", border: "2px solid #7f1d1d", color: "#fecaca" }}>
            {err}
          </div>
        )}

        {loading && (
          <p className="text-sm" style={{ color: "#64748b" }}>Loading tasks…</p>
        )}

        {!loading && !rows.length && !err && (
          <div style={{ ...CARD, padding: "16px", color: "#94a3b8" }}>
            <p className="text-sm">No tasks found for this filter.</p>
            <p className="text-xs mt-2" style={{ color: "#64748b" }}>
              New signups get starter tasks from the DB trigger. For accounts that already existed, run{" "}
              <code className="text-slate-500">006_backfill_starter_user_tasks.sql</code> in the Supabase SQL editor
              (or switch to <strong>All</strong> after backfill). In <strong>Learning</strong> mode, try activating a
              node that maps to frontend, backend, or databases on the Skill Tree tab.
            </p>
          </div>
        )}

        {bySkill.map(([skillKey, items]) => (
          <section key={skillKey} style={CARD}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "2px solid #1a2744" }}>
              <div>
                <h2 style={{ fontFamily: PF, fontSize: "10px", color: "#e2e8f0" }}>{skillKey.toUpperCase()}</h2>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>{items.length} task(s)</p>
              </div>
              <button type="button" onClick={() => void refresh()} style={BTN("#122040", "#1e3a6a", "#06111e")}>
                Refresh
              </button>
            </div>

            <div className="px-4 py-3 space-y-3">
              {items.map(({ task, userTask }) => (
                <div key={task.task_key} className="flex flex-col md:flex-row md:items-center gap-3"
                  style={{ background: "#0d1a2e", border: "2px solid #1e3858", padding: "12px" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const row = rows.find(r => r.task.task_key === task.task_key);
                          if (row) {
                            setQuestRow(row);
                            setQuestTopicLabel(undefined);
                          }
                        }}
                        style={{
                          fontFamily: PF,
                          fontSize: "8px",
                          color: "#cbd5e1",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: 0,
                        }}
                      >
                        {task.title} <span style={{ color: "#475569", fontSize: "7px" }}>(open)</span>
                      </button>
                      {badge(userTask.status.replace("_", " "), statusColor(userTask.status))}
                      {task.difficulty ? badge(task.difficulty, "#F472B6") : null}
                      {badge(`+${task.xp_reward} XP`, "#6ED640")}
                      {task.estimated_minutes ? badge(`${task.estimated_minutes} min`, "#94a3b8") : null}
                    </div>
                    {task.description && (
                      <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>{task.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2" style={{ background: "#162238", border: "1px solid #1e3858" }}>
                        <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, userTask.progress ?? 0))}%`, background: "#6ED640" }} />
                      </div>
                      <span style={{ fontFamily: PF, fontSize: "7px", color: "#64748b" }}>{userTask.progress ?? 0}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {userTask.status !== "completed" && (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            await startTask(task.task_key);
                            await refresh();
                          }}
                          style={BTN(userTask.status === "available" ? "#6ED640" : "#122040", "#1e3a6a", "#06111e")}
                        >
                          Start
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const next = Math.min(100, (userTask.progress ?? 0) + 25);
                            await updateTaskProgress(task.task_key, next);
                            await refresh();
                          }}
                          style={BTN("#122040", "#1e3a6a", "#06111e")}
                        >
                          +25%
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await completeTask(task.task_key);
                            await refresh();
                            if (onSkillsUpdated) await onSkillsUpdated();
                            else router.refresh();
                          }}
                          style={BTN("#6ED640", "#3A9018", "#1E6010")}
                        >
                          Complete
                        </button>
                      </>
                    )}
                    {userTask.status === "completed" && (
                      <span style={{ fontFamily: PF, fontSize: "7px", color: "#6ED640" }}>DONE</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
