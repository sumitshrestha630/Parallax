/**
 * Pure helper functions for the dashboard layer.
 * No Supabase calls here – those live in lib/supabase/queries.ts.
 * This file handles data transformation, XP math, and debounced sync.
 */

import type { UserSkill, MappedSkillNode, DashboardData } from "@/types/dashboard";
import { CPU_SKILL_DEFAULTS } from "@/lib/dashboard/cpu-map-defaults";
import { getTrack } from "@/lib/skill-tree-data";
import { cpuFocusSkillForCareer, resolveCareerRawPath } from "@/lib/dashboard/career-dashboard";

// ── Skill / node helpers ──────────────────────────────────────────────────────

/** `??` does not replace NaN — metadata / xp from JSON may omit values or use bad types. */
export function finiteOr(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nonEmptyTrimmed(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

/**
 * Maps Supabase rows onto the canonical 8-track CPU map.
 * Always returns all routes so connection paths render; DB metadata only overrides when valid.
 */
export function skillsToNodes(skills: UserSkill[]): MappedSkillNode[] {
  const byKey = Object.fromEntries(skills.map(s => [s.skill_key, s]));

  return CPU_SKILL_DEFAULTS.map(def => {
    const s = byKey[def.id];
    const meta = (s?.metadata ?? {}) as Record<string, unknown>;

    const pathUse = nonEmptyTrimmed(meta.path) ?? def.path;
    const colorUse = nonEmptyTrimmed(meta.color) ?? def.color;
    const dashUse = nonEmptyTrimmed(meta.dashDuration) ?? def.dashDuration;

    if (!s) {
      return {
        id:           def.id,
        label:        def.label,
        ex:           def.ex,
        ey:           def.ey,
        path:         def.path,
        color:        def.color,
        dashDuration: def.dashDuration,
        state:        "locked",
        xp:           0,
      };
    }

    return {
      id:           def.id,
      label:        nonEmptyTrimmed(s.skill_name) ?? def.label,
      ex:           finiteOr(meta.ex, def.ex),
      ey:           finiteOr(meta.ey, def.ey),
      path:         pathUse,
      color:        colorUse,
      dashDuration: dashUse,
      state:        s.unlocked ? "active" : "locked",
      xp:           finiteOr(s.xp, 0),
    };
  });
}

/** Returns the sum of XP across all skills. */
export function computeTotalXp(skills: UserSkill[]): number {
  return skills.reduce((acc, s) => acc + Number(s.xp ?? 0), 0);
}

/** Derives the overall level from total XP (200 XP per level). */
export function computeLevel(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / 200) + 1);
}

/** Counts how many skills are unlocked. */
export function countUnlocked(skills: UserSkill[]): number {
  return skills.filter(s => s.unlocked).length;
}

// ── XP grant helper ───────────────────────────────────────────────────────────

const XP_PER_LEVEL = 200;

/**
 * Given a skill's current xp and the XP being added, returns the new
 * xp and level values. Does NOT call Supabase – just computes new values.
 */
export function applyXpGrant(
  currentXp: number,
  currentLevel: number,
  grantedXp: number
): { xp: number; level: number } {
  const xp    = currentXp + grantedXp;
  const level = Math.max(currentLevel, Math.floor(xp / XP_PER_LEVEL) + 1);
  return { xp, level };
}

// ── Context builder ───────────────────────────────────────────────────────────

/** Builds the DashboardContext from loaded Supabase data. */
export function buildDashboardContext(
  data: DashboardData,
  username: string,
  options?: { fallbackCareerId?: string | null }
) {
  const totalXp = computeTotalXp(data.skills);
  const rawPath = resolveCareerRawPath(data.state, options?.fallbackCareerId ?? undefined);
  const track = getTrack(rawPath);
  const careerTrackId = track.id;
  const careerTrackLabel = track.label;
  const cpuFocusSkillKey = cpuFocusSkillForCareer(careerTrackId);
  return {
    userId:       data.profile?.id ?? "",
    username,
    careerTrackId,
    cpuFocusSkillKey,
    careerTrackLabel,
    skills:       data.skills,
    achievements: data.achievements,
    state:        data.state,
    taskSummary:  data.taskSummary,
    totalXp,
  };
}

// ── Debounced Supabase sync ───────────────────────────────────────────────────

/**
 * Returns a debounced version of `fn`.
 * Use this to batch rapid UI interactions (e.g. XP updates) into one DB write.
 *
 * Usage:
 *   const debouncedSave = debounce((layout) => updateDashboardLayout(sb, id, layout), 800);
 *   debouncedSave(newLayout); // called on every drag event, flushes 800 ms after last call
 */
export function debounce<A extends readonly unknown[]>(
  fn: (...args: A) => unknown,
  ms = 800
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
