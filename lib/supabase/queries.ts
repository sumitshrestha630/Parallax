/**
 * Typed Supabase query helpers.
 *
 * Each function accepts a Supabase client so it works in both
 * server components (pass the server client) and client components
 * (pass the browser client).
 *
 * Usage – server:
 *   import { createClient } from "@/lib/supabase/server";
 *   const sb = await createClient();
 *   const data = await getDashboardData(sb, user.id);
 *
 * Usage – client:
 *   import { createClient } from "@/lib/supabase/client";
 *   const sb = createClient();
 *   await updateSkillProgress(sb, userId, "frontend", 50, 2, true);
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Profile,
  UserDashboardItem,
  UserSkill,
  UserAchievement,
  UserDashboardState,
  DashboardData,
  DashboardItemLayout,
  TaskSummary,
  UserTask,
} from "@/types/dashboard";
import type { SkillTreePersistedV1 } from "@/lib/skill-tree-data";

// ── Read helpers ──────────────────────────────────────────────────────────────

export async function getUserProfile(
  sb: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") return null;
  return (data as Profile) ?? null;
}

export async function getUserDashboardItems(
  sb: SupabaseClient,
  userId: string
): Promise<UserDashboardItem[]> {
  const { data } = await sb
    .from("user_dashboard_items")
    .select("*")
    .eq("user_id", userId)
    .eq("visible", true)
    .order("sort_order");
  return (data as UserDashboardItem[]) ?? [];
}

export async function getUserSkills(
  sb: SupabaseClient,
  userId: string
): Promise<UserSkill[]> {
  const { data } = await sb
    .from("user_skills")
    .select("*")
    .eq("user_id", userId)
    .order("skill_key");
  return (data as UserSkill[]) ?? [];
}

export async function getUserAchievements(
  sb: SupabaseClient,
  userId: string
): Promise<UserAchievement[]> {
  const { data } = await sb
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });
  return (data as UserAchievement[]) ?? [];
}

export async function getUserDashboardState(
  sb: SupabaseClient,
  userId: string
): Promise<UserDashboardState | null> {
  const { data, error } = await sb
    .from("user_dashboard_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") return null;
  return (data as UserDashboardState) ?? null;
}

export async function getUserTasks(
  sb: SupabaseClient,
  userId: string
): Promise<UserTask[]> {
  const { data, error } = await sb
    .from("user_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("assigned_at", { ascending: false });
  if (error) return [];
  return (data as UserTask[]) ?? [];
}

export async function getTaskSummary(
  sb: SupabaseClient,
  userId: string
): Promise<TaskSummary> {
  const tasks = await getUserTasks(sb, userId);
  return tasks.reduce(
    (acc, t) => {
      if (t.status === "in_progress") acc.active += 1;
      if (t.status === "available") acc.available += 1;
      if (t.status === "completed") acc.completed += 1;
      acc.xpEarned += Number(t.xp_earned ?? 0);
      return acc;
    },
    { active: 0, available: 0, completed: 0, xpEarned: 0 } as TaskSummary
  );
}

/** Single call that fetches all dashboard data in parallel. */
export async function getDashboardData(
  sb: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  const [profile, items, skills, achievements, state, taskSummary] = await Promise.all([
    getUserProfile(sb, userId),
    getUserDashboardItems(sb, userId),
    getUserSkills(sb, userId),
    getUserAchievements(sb, userId),
    getUserDashboardState(sb, userId),
    getTaskSummary(sb, userId),
  ]);
  return { profile, items, skills, achievements, state, taskSummary };
}

// ── Write helpers ─────────────────────────────────────────────────────────────

export async function updateDashboardLayout(
  sb: SupabaseClient,
  itemId: string,
  layout: DashboardItemLayout
): Promise<void> {
  await sb
    .from("user_dashboard_items")
    .update({ layout })
    .eq("id", itemId);
}

export async function updateDashboardProps(
  sb: SupabaseClient,
  itemId: string,
  props: Record<string, unknown>
): Promise<void> {
  await sb
    .from("user_dashboard_items")
    .update({ props })
    .eq("id", itemId);
}

export async function toggleDashboardItem(
  sb: SupabaseClient,
  itemId: string,
  visible: boolean
): Promise<void> {
  await sb
    .from("user_dashboard_items")
    .update({ visible })
    .eq("id", itemId);
}

export async function updateSkillProgress(
  sb: SupabaseClient,
  userId: string,
  skillKey: string,
  xp: number,
  level: number,
  unlocked: boolean
): Promise<void> {
  await sb
    .from("user_skills")
    .update({ xp, level, unlocked })
    .eq("user_id", userId)
    .eq("skill_key", skillKey);
}

export async function unlockAchievement(
  sb: SupabaseClient,
  userId: string,
  badgeKey: string,
  title: string,
  description?: string
): Promise<void> {
  await sb.from("user_achievements").upsert(
    { user_id: userId, badge_key: badgeKey, title, description },
    { onConflict: "user_id,badge_key", ignoreDuplicates: true }
  );
}

export async function updateDashboardState(
  sb: SupabaseClient,
  userId: string,
  patch: Partial<
    Pick<UserDashboardState, "theme" | "active_avatar" | "selected_path" | "sidebar_collapsed" | "metadata">
  >
): Promise<void> {
  await sb
    .from("user_dashboard_state")
    .update(patch)
    .eq("user_id", userId);
}

/**
 * Merges skill-tree progress into `user_dashboard_state.metadata.skill_tree`.
 * Reads current metadata first so other keys are preserved. Upserts the row if missing.
 */
export async function saveSkillTreeProgress(
  sb: SupabaseClient,
  userId: string,
  payload: SkillTreePersistedV1
): Promise<void> {
  const { data: row } = await sb
    .from("user_dashboard_state")
    .select("id, metadata")
    .eq("user_id", userId)
    .maybeSingle();

  const prev =
    row?.metadata && typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};
  const metadata = { ...prev, skill_tree: payload as unknown as Record<string, unknown> };

  if (row?.id) {
    await sb.from("user_dashboard_state").update({ metadata }).eq("user_id", userId);
  } else {
    await sb.from("user_dashboard_state").insert({
      user_id:       userId,
      metadata,
      selected_path: payload.lastTrackId,
    });
  }
}
