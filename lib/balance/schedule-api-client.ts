"use client";

import type { ScheduleEvent } from "@/types/balance";
import type { ScheduleEventInsert } from "@/lib/supabase/balance-queries";

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

export async function fetchScheduleViaApi(): Promise<ScheduleEvent[]> {
  const res = await fetch("/api/schedule", { credentials: "same-origin" });
  return parseResponse<ScheduleEvent[]>(res);
}

export async function createScheduleViaApi(row: ScheduleEventInsert): Promise<ScheduleEvent> {
  const res = await fetch("/api/schedule", {
    credentials: "same-origin",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  return parseResponse<ScheduleEvent>(res);
}

export async function updateScheduleViaApi(
  id: string,
  patch: Partial<Pick<ScheduleEvent, "title" | "type" | "day" | "start_time" | "end_time" | "intensity">>
): Promise<void> {
  const res = await fetch(`/api/schedule?id=${encodeURIComponent(id)}`, {
    credentials: "same-origin",
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  await parseResponse<unknown>(res);
}

export async function deleteScheduleViaApi(id: string): Promise<void> {
  const res = await fetch(`/api/schedule?id=${encodeURIComponent(id)}`, {
    credentials: "same-origin",
    method: "DELETE",
  });
  await parseResponse<unknown>(res);
}
