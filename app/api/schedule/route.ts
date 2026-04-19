import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createScheduleEvent,
  deleteScheduleEvent,
  fetchScheduleEvents,
  updateScheduleEvent,
  type ScheduleEventInsert,
} from "@/lib/supabase/balance-queries";
import type { ScheduleEvent } from "@/types/balance";

type AuthOk = { ok: true; sb: Awaited<ReturnType<typeof createClient>>; userId: string };
type AuthFail = { ok: false; response: NextResponse };

async function authContext(): Promise<AuthOk | AuthFail> {
  const sb = await createClient();
  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, sb, userId: user.id };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function formatScheduleError(e: unknown, fallback: string): string {
  const anyErr = e as { code?: unknown; message?: unknown } | null;
  const code = anyErr?.code != null ? String(anyErr.code) : "";
  const msg = anyErr?.message != null ? String(anyErr.message) : "";

  if (
    code === "42P01" ||
    msg.includes("user_schedule_events") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  ) {
    return "Schedule table is missing. Run migration `supabase/migrations/002_user_schedule_events.sql` in Supabase SQL Editor, then refresh.";
  }

  if (
    code === "42501" ||
    msg.toLowerCase().includes("permission denied") ||
    msg.toLowerCase().includes("rls")
  ) {
    return "Permission denied (RLS). Ensure you are signed in and the RLS policies from `002_user_schedule_events.sql` are applied.";
  }

  return msg || (e instanceof Error ? e.message : fallback);
}

function parseInsertBody(body: unknown): ScheduleEventInsert | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const title       = o.title;
  const type        = o.type;
  const day         = o.day;
  const start_time  = o.start_time;
  const end_time    = o.end_time;
  const intensity   = o.intensity;
  if (typeof title !== "string" || typeof start_time !== "string" || typeof end_time !== "string") return null;
  if (type !== "class" && type !== "work" && type !== "custom") return null;
  if (intensity !== "busy" && intensity !== "medium") return null;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  if (!days.includes(day as (typeof days)[number])) return null;
  return {
    title: title.trim(),
    type,
    day: day as ScheduleEventInsert["day"],
    start_time,
    end_time,
    intensity,
  };
}

function parsePatchBody(body: unknown): Partial<
  Pick<ScheduleEvent, "title" | "type" | "day" | "start_time" | "end_time" | "intensity">
> | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const patch: Partial<Pick<ScheduleEvent, "title" | "type" | "day" | "start_time" | "end_time" | "intensity">> = {};
  if ("title" in o && typeof o.title === "string") patch.title = o.title.trim();
  if ("type" in o && (o.type === "class" || o.type === "work" || o.type === "custom")) patch.type = o.type;
  if ("intensity" in o && (o.intensity === "busy" || o.intensity === "medium")) patch.intensity = o.intensity;
  if ("start_time" in o && typeof o.start_time === "string") patch.start_time = o.start_time;
  if ("end_time" in o && typeof o.end_time === "string") patch.end_time = o.end_time;
  if ("day" in o) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
    if (typeof o.day === "string" && days.includes(o.day as (typeof days)[number])) patch.day = o.day as ScheduleEvent["day"];
  }
  return Object.keys(patch).length ? patch : null;
}

export async function GET() {
  const ctx = await authContext();
  if (!ctx.ok) return ctx.response;
  try {
    const events = await fetchScheduleEvents(ctx.sb, ctx.userId);
    return NextResponse.json(events);
  } catch (e: unknown) {
    return jsonError(formatScheduleError(e, "Failed to load schedule"), 500);
  }
}

export async function POST(req: Request) {
  const ctx = await authContext();
  if (!ctx.ok) return ctx.response;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const row = parseInsertBody(raw);
  if (!row || !row.title) return jsonError("Invalid schedule payload", 400);
  try {
    const created = await createScheduleEvent(ctx.sb, ctx.userId, row);
    return NextResponse.json(created);
  } catch (e: unknown) {
    return jsonError(formatScheduleError(e, "Failed to create event"), 500);
  }
}

export async function PATCH(req: Request) {
  const ctx = await authContext();
  if (!ctx.ok) return ctx.response;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("Missing id", 400);
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const patch = parsePatchBody(raw);
  if (!patch) return jsonError("Invalid patch payload", 400);
  try {
    await updateScheduleEvent(ctx.sb, id, patch);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return jsonError(formatScheduleError(e, "Failed to update event"), 500);
  }
}

export async function DELETE(req: Request) {
  const ctx = await authContext();
  if (!ctx.ok) return ctx.response;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("Missing id", 400);
  try {
    await deleteScheduleEvent(ctx.sb, id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return jsonError(formatScheduleError(e, "Failed to delete event"), 500);
  }
}
