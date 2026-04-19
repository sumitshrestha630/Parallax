"use client";

import type { TaskSummary, TaskWithUserState, UserTaskStatus } from "@/types/dashboard";

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error(text || res.statusText);
    }
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: unknown }).error)
        : res.statusText;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data as T;
}

export type TasksQuery = {
  mode?: "learning" | "all";
  status?: UserTaskStatus;
  skillKey?: string;
  difficulty?: string;
  /** Pass true to attach `resources` per task when available (task_resources join). */
  includeResources?: boolean;
};

export async function fetchTasks(query: TasksQuery = {}): Promise<{
  rows: TaskWithUserState[];
  summary: TaskSummary;
  learningSkillKeys?: string[];
}> {
  const sp = new URLSearchParams();
  if (query.mode) sp.set("mode", query.mode);
  if (query.status) sp.set("status", query.status);
  if (query.skillKey) sp.set("skillKey", query.skillKey);
  if (query.difficulty) sp.set("difficulty", query.difficulty);
  if (query.includeResources) sp.set("includeResources", "1");
  const res = await fetch(`/api/tasks?${sp.toString()}`, { credentials: "same-origin" });
  return parseResponse<{
    rows: TaskWithUserState[];
    summary: TaskSummary;
    learningSkillKeys?: string[];
  }>(res);
}

export async function startTask(taskKey: string): Promise<void> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start", taskKey }),
  });
  await parseResponse<unknown>(res);
}

export async function updateTaskProgress(taskKey: string, progress: number): Promise<void> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "progress", taskKey, progress }),
  });
  await parseResponse<unknown>(res);
}

export async function completeTask(taskKey: string): Promise<{ awardedXp: number; skillKey: string; nextXp: number; nextLevel: number }> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete", taskKey }),
  });
  return parseResponse<{ ok: true; awardedXp: number; skillKey: string; nextXp: number; nextLevel: number }>(res);
}

