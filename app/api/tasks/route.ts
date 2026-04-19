import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserTaskStatus } from "@/types/dashboard";
import { resolveLearningSkillKeys } from "@/lib/dashboard/learning-skill-keys";
import { enrichTasksWithResources } from "@/lib/dashboard/task-service";

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

function parseStatus(s: string | null): UserTaskStatus | null {
  if (!s) return null;
  if (s === "locked" || s === "available" || s === "in_progress" || s === "completed") return s;
  return null;
}

function uniqueStrings(xs: string[]): string[] {
  return [...new Set(xs.filter(Boolean))];
}

export async function GET(req: Request) {
  const ctx = await authContext();
  if (!ctx.ok) return ctx.response;

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "learning";
  let learningKeysForResponse: string[] | undefined;
  const status = parseStatus(url.searchParams.get("status"));
  const skillKey = url.searchParams.get("skillKey");
  const difficulty = url.searchParams.get("difficulty");
  const includeResources = url.searchParams.get("includeResources") === "1";

  // Mode options:
  // - learning: tasks for skills currently in_progress
  // - all: all tasks assigned to the user
  const base = ctx.sb
    .from("user_tasks")
    .select("*, tasks!inner(*)")
    .eq("user_id", ctx.userId);

  let q = base;
  if (status) q = q.eq("status", status);
  if (skillKey) q = q.eq("skill_key", skillKey);
  if (difficulty) q = q.eq("tasks.difficulty", difficulty);

  let learningKeys: string[] | undefined;
  if (mode === "learning") {
    // Prefer active nodes from persisted skill tree → mapped skill_keys;
    // else in_progress user_skills; else unlocked skills (see learning-skill-keys.ts).
    learningKeys = await resolveLearningSkillKeys(ctx.sb, ctx.userId);
    learningKeysForResponse = learningKeys;
    if (learningKeys.length === 0) {
      return NextResponse.json({
        rows: [],
        summary: { active: 0, available: 0, completed: 0, xpEarned: 0 },
        learningSkillKeys: [] as string[],
      });
    }
    q = q.in("skill_key", learningKeys);
  }

  let { data, error } = await q
    .order("skill_key", { ascending: true })
    .order("order_index", { ascending: true, foreignTable: "tasks" });

  if (error) return jsonError(error.message, 500);

  // Learning mode: tree "active" nodes may map to skills with no rows in user_tasks yet
  // (e.g. projects) while starter tasks exist for frontend/backend/databases — widen to
  // any skill_key the user actually has assigned.
  if (mode === "learning" && learningKeys && learningKeys.length > 0 && (!data || data.length === 0)) {
    const { data: assignRows } = await ctx.sb
      .from("user_tasks")
      .select("skill_key")
      .eq("user_id", ctx.userId);
    const assignedKeys = uniqueStrings((assignRows ?? []).map(r => r.skill_key as string));
    if (assignedKeys.length > 0) {
      let q2 = base;
      if (status) q2 = q2.eq("status", status);
      if (skillKey) q2 = q2.eq("skill_key", skillKey);
      if (difficulty) q2 = q2.eq("tasks.difficulty", difficulty);
      q2 = q2.in("skill_key", assignedKeys);
      const res2 = await q2
        .order("skill_key", { ascending: true })
        .order("order_index", { ascending: true, foreignTable: "tasks" });
      if (!res2.error && res2.data && res2.data.length > 0) {
        data = res2.data;
        learningKeysForResponse = assignedKeys;
      }
    }
  }

  const rows = (data ?? []).map(r => ({
    userTask: {
      id: r.id,
      user_id: r.user_id,
      task_key: r.task_key,
      skill_key: r.skill_key,
      status: r.status,
      progress: r.progress ?? 0,
      completed: !!r.completed,
      assigned_at: r.assigned_at,
      completed_at: r.completed_at ?? null,
      xp_earned: r.xp_earned ?? 0,
      metadata: (r.metadata ?? {}) as Record<string, unknown>,
    },
    task: r.tasks,
  }));

  const enriched = includeResources ? await enrichTasksWithResources(ctx.sb, rows as any) : rows;

  const summary = enriched.reduce(
    (acc: { active: number; available: number; completed: number; xpEarned: number }, x: any) => {
      const st = x.userTask.status as UserTaskStatus;
      if (st === "in_progress") acc.active += 1;
      if (st === "available") acc.available += 1;
      if (st === "completed") acc.completed += 1;
      acc.xpEarned += Number(x.userTask.xp_earned ?? 0);
      return acc;
    },
    { active: 0, available: 0, completed: 0, xpEarned: 0 }
  );

  return NextResponse.json({
    rows: enriched,
    summary,
    ...(mode === "learning" ? { learningSkillKeys: learningKeysForResponse ?? [] } : {}),
  });
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

  const body = raw as Record<string, unknown>;
  const action = String(body.action ?? "");
  const taskKey = typeof body.taskKey === "string" ? body.taskKey : "";
  if (!taskKey) return jsonError("Missing taskKey", 400);

  if (action === "start") {
    const { error } = await ctx.sb
      .from("user_tasks")
      .update({ status: "in_progress" })
      .eq("user_id", ctx.userId)
      .eq("task_key", taskKey)
      .in("status", ["available", "in_progress"]);
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true });
  }

  if (action === "progress") {
    const progress = typeof body.progress === "number" ? Math.max(0, Math.min(100, body.progress)) : null;
    if (progress === null) return jsonError("Missing progress", 400);
    const { error } = await ctx.sb
      .from("user_tasks")
      .update({ progress, status: "in_progress" })
      .eq("user_id", ctx.userId)
      .eq("task_key", taskKey);
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true });
  }

  if (action === "complete") {
    // Load task to compute XP reward + linked skill.
    const { data: t, error: tErr } = await ctx.sb
      .from("tasks")
      .select("task_key, skill_key, xp_reward")
      .eq("task_key", taskKey)
      .single();
    if (tErr) return jsonError(tErr.message, 500);

    const xp = Number(t.xp_reward ?? 0);
    const skillKey = String(t.skill_key);

    const { error: utErr } = await ctx.sb
      .from("user_tasks")
      .update({
        status: "completed",
        completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: xp,
        progress: 100,
      })
      .eq("user_id", ctx.userId)
      .eq("task_key", taskKey);
    if (utErr) return jsonError(utErr.message, 500);

    // Award XP to the linked user_skill.
    const { data: us, error: usErr } = await ctx.sb
      .from("user_skills")
      .select("xp, level")
      .eq("user_id", ctx.userId)
      .eq("skill_key", skillKey)
      .maybeSingle();
    if (usErr) return jsonError(usErr.message, 500);

    const prevXp = Number(us?.xp ?? 0);
    const nextXp = prevXp + xp;
    const nextLevel = Math.max(1, Math.floor(nextXp / 200) + 1);

    const { data: updatedRows, error: updErr } = await ctx.sb
      .from("user_skills")
      .update({ xp: nextXp, level: nextLevel })
      .eq("user_id", ctx.userId)
      .eq("skill_key", skillKey)
      .select("id");
    if (updErr) return jsonError(updErr.message, 500);

    // No row for this skill yet (e.g. older account) — insert so XP actually lands.
    if (!updatedRows?.length) {
      const { data: cat } = await ctx.sb
        .from("skills")
        .select("skill_name")
        .eq("skill_key", skillKey)
        .maybeSingle();
      const skillName = String(cat?.skill_name ?? skillKey);
      const { error: insErr } = await ctx.sb.from("user_skills").insert({
        user_id: ctx.userId,
        skill_key: skillKey,
        skill_name: skillName,
        xp: nextXp,
        level: nextLevel,
        unlocked: true,
      });
      if (insErr) return jsonError(insErr.message, 500);
    }

    return NextResponse.json({ ok: true, awardedXp: xp, skillKey, nextXp, nextLevel });
  }

  return jsonError("Unknown action", 400);
}

