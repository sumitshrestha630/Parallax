/**
 * CRUD for `user_schedule_events` — use with browser or server Supabase client.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleEvent } from "@/types/balance";

export async function fetchScheduleEvents(
  sb: SupabaseClient,
  userId: string
): Promise<ScheduleEvent[]> {
  const { data, error } = await sb
    .from("user_schedule_events")
    .select("*")
    .eq("user_id", userId)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ScheduleEvent[];
}

export type ScheduleEventInsert = Omit<
  ScheduleEvent,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export async function createScheduleEvent(
  sb: SupabaseClient,
  userId: string,
  row: ScheduleEventInsert
): Promise<ScheduleEvent> {
  const { data, error } = await sb
    .from("user_schedule_events")
    .insert({ user_id: userId, ...row })
    .select()
    .single();

  if (error) throw error;
  return data as ScheduleEvent;
}

export async function updateScheduleEvent(
  sb: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<ScheduleEvent, "title" | "type" | "day" | "start_time" | "end_time" | "intensity">
  >
): Promise<void> {
  const { error } = await sb.from("user_schedule_events").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteScheduleEvent(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from("user_schedule_events").delete().eq("id", id);
  if (error) throw error;
}
