import type { TaskWithUserState } from "@/types/dashboard";
import { getSuggestedTasksForSkill, normalizeSkillTreeNodeKey } from "@/lib/tasks/suggested-tasks";

/** Prefer tasks you can still work on; otherwise first by catalog order. */
export function pickPreferredTask(rows: TaskWithUserState[]): TaskWithUserState | undefined {
  const rank = (s: TaskWithUserState["userTask"]["status"]) =>
    ({ available: 0, in_progress: 1, completed: 2, locked: 3 }[s] ?? 99);
  const sorted = [...rows].sort((a, b) => {
    const d = rank(a.userTask.status) - rank(b.userTask.status);
    if (d !== 0) return d;
    return (a.task.order_index ?? 0) - (b.task.order_index ?? 0);
  });
  return sorted[0];
}

export function findNextTaskInLane(rows: TaskWithUserState[], current: TaskWithUserState): TaskWithUserState | undefined {
  const lane = rows
    .filter(r => r.task.skill_key === current.task.skill_key)
    .sort((a, b) => (a.task.order_index ?? 0) - (b.task.order_index ?? 0));
  const i = lane.findIndex(r => r.task.task_key === current.task.task_key);
  return i >= 0 ? lane[i + 1] : undefined;
}

/**
 * Next Rooted task for this Skill Tree node: match curated task_keys when present in the user’s rows,
 * else best preferred task in the lane.
 */
export function pickPrimaryTaskForNode(nodeId: string, rows: TaskWithUserState[]): TaskWithUserState | undefined {
  if (rows.length === 0) return undefined;
  const canonical = normalizeSkillTreeNodeKey(nodeId);
  const curated = getSuggestedTasksForSkill(canonical);
  for (const st of curated) {
    const row = rows.find(r => r.task.task_key === st.task_key && r.userTask.status !== "completed");
    if (row) return row;
  }
  const incomplete = rows.filter(r => r.userTask.status !== "completed");
  if (incomplete.length === 0) return undefined;
  return pickPreferredTask(incomplete);
}
