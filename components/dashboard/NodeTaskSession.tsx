"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TaskWithUserState } from "@/types/dashboard";
import { getSuggestedTasksForSkill, normalizeSkillTreeNodeKey } from "@/lib/tasks/suggested-tasks";
import { fetchTasks, completeTask, startTask } from "@/lib/dashboard/tasks-api-client";
import {
  pickPrimaryTaskForNode,
  findNextTaskInLane,
} from "@/lib/dashboard/task-row-utils";
import { TaskQuestDetail } from "@/components/dashboard/TaskQuestDetail";

const PF = "'Press Start 2P', monospace";

const CARD: React.CSSProperties = { background: "#060c18", border: "2px solid #1a2744" };

export function NodeTaskSession({
  nodeId,
  skillLane,
  nodeLabel,
  source,
  onSkillsUpdated,
}: {
  nodeId: string;
  skillLane: string;
  nodeLabel?: string;
  source?: string;
  onSkillsUpdated?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<TaskWithUserState[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [questRow, setQuestRow] = useState<TaskWithUserState | null>(null);

  const canonicalId = useMemo(() => normalizeSkillTreeNodeKey(nodeId), [nodeId]);
  const curated = useMemo(() => getSuggestedTasksForSkill(canonicalId), [canonicalId]);

  const listHref =
    `/tasks?node=${encodeURIComponent(nodeId)}` +
    `&skill=${encodeURIComponent(skillLane)}` +
    (nodeLabel ? `&label=${encodeURIComponent(nodeLabel)}` : "") +
    (source ? `&source=${encodeURIComponent(source)}` : "");

  const refresh = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetchTasks({
        mode: "all",
        skillKey: skillLane,
        includeResources: true,
      });
      setRows(res.rows);
      return res.rows;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load tasks");
      return [];
    } finally {
      setLoading(false);
    }
  }, [skillLane]);

  useEffect(() => {
    void refresh().then(loaded => {
      const primary = pickPrimaryTaskForNode(nodeId, loaded);
      setQuestRow(primary ?? null);
    });
  }, [refresh, nodeId]);

  const nextInLane = questRow ? findNextTaskInLane(rows, questRow) : undefined;

  const runComplete = async (taskKey: string) => {
    await completeTask(taskKey);
    const nextRows = await fetchTasks({
      mode: "all",
      skillKey: skillLane,
      includeResources: true,
    });
    setRows(nextRows.rows);
    setQuestRow(pickPrimaryTaskForNode(nodeId, nextRows.rows) ?? null);
    if (onSkillsUpdated) await onSkillsUpdated();
    else router.refresh();
  };

  const displayLabel = nodeLabel ?? canonicalId.replace(/_/g, " ");

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm" style={{ color: "#64748b", fontFamily: PF }}>
          Loading your task…
        </p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm" style={{ color: "#fecaca" }}>
          {err}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          style={{
            fontFamily: PF,
            fontSize: "12px",
            background: "#122040",
            border: "2px solid #1e3858",
            color: "#6ED640",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (questRow) {
    return (
      <TaskQuestDetail
        row={questRow}
        topicLabel={displayLabel}
        practiceGuide={curated}
        onBack={() => router.push("/dashboard")}
        onComplete={() => runComplete(questRow.task.task_key)}
        onNextTask={
          nextInLane
            ? () => {
                setQuestRow(nextInLane);
                if (nextInLane.userTask.status === "available") {
                  void startTask(nextInLane.task.task_key);
                }
              }
            : undefined
        }
        nextTaskTitle={nextInLane?.task.title ?? null}
      />
    );
  }

  const allDone =
    rows.length > 0 && rows.every(r => r.userTask.status === "completed" || r.userTask.status === "locked");

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8">
      <header className="mb-6">
        <h1 style={{ fontFamily: PF, fontSize: "12px", color: "#78E04A", marginBottom: "8px" }}>
          {displayLabel}
        </h1>
        <p className="text-xs" style={{ color: "#64748b" }}>
          Lane <span style={{ color: "#94a3b8" }}>{skillLane}</span>
          {allDone ? " · All assigned tasks in this lane are finished or locked." : " · No Rooted task matched this node yet."}
        </p>
        <p className="text-xs mt-3" style={{ color: "#475569" }}>
          Use the curated steps below, or open the full task list to start a task from the catalog.
        </p>
      </header>

      {curated.length > 0 ? (
        <section style={{ ...CARD, padding: "16px" }} className="mb-6">
          <h2 style={{ fontFamily: PF, fontSize: "13px", color: "#78E04A", marginBottom: "12px" }}>
            Practice for this node
          </h2>
          <div className="space-y-4">
            {curated.map(st => (
              <details
                key={st.task_key}
                className="rounded-sm border border-[#1e3858] bg-[#0d1a2e] px-3 py-2"
              >
                <summary className="cursor-pointer list-none py-1 text-sm" style={{ color: "#e2e8f0" }}>
                  {st.title}
                </summary>
                <p className="text-xs mt-2 mb-2" style={{ color: "#94a3b8" }}>
                  {st.description}
                </p>
                <ol className="text-xs space-y-1 list-decimal pl-5" style={{ color: "#cbd5e1" }}>
                  {st.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-xs mb-6" style={{ color: "#64748b" }}>
          No curated outline for this node yet. Open the lane list to pick a task.
        </p>
      )}

      <Link
        href={listHref}
        style={{
          fontFamily: PF,
          fontSize: "13px",
          display: "inline-block",
          background: "#6ED640",
          border: "3px solid #3A9018",
          color: "#0a1a06",
          padding: "12px 20px",
          textAlign: "center",
          maxWidth: "360px",
        }}
      >
        Open full task list for this lane
      </Link>
    </div>
  );
}
