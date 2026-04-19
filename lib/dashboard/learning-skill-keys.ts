import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getTrack,
  nodesFromProgress,
  parseSkillTreePersisted,
  type SkillNode,
} from "@/lib/skill-tree-data";
import { SKILL_TREE_NODE_TO_SKILL_KEY } from "@/lib/dashboard/skill-tree-task-map";

function uniqueStrings(xs: string[]): string[] {
  return [...new Set(xs.filter(Boolean))];
}

/**
 * Skill keys the user is "learning now" from the gamified skill tree:
 * all nodes in **active** state on the current track, mapped to catalog skill_keys.
 */
export function skillKeysFromSkillTreeMetadata(metadata: Record<string, unknown> | null | undefined): string[] {
  const persisted = parseSkillTreePersisted(metadata ?? null);
  const trackId = persisted?.lastTrackId ?? "software_engineer";
  const track = getTrack(trackId);
  const completed = persisted?.tracks?.[trackId]?.completed ?? [];
  const nodes: SkillNode[] = nodesFromProgress(track.nodes, completed);
  const activeIds = nodes.filter(n => n.state === "active").map(n => n.id);
  const keys = activeIds
    .map(id => SKILL_TREE_NODE_TO_SKILL_KEY[id])
    .filter((k): k is string => typeof k === "string" && k.length > 0);
  return uniqueStrings(keys);
}

/**
 * Resolves which skill_keys to use for "learning" tasks:
 * 1) Active nodes from persisted skill tree (preferred)
 * 2) user_skills.in_progress = true
 * 3) unlocked user_skills (up to 8), so tasks always show something when rows exist
 */
export async function resolveLearningSkillKeys(
  sb: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data: stateRow } = await sb
    .from("user_dashboard_state")
    .select("metadata")
    .eq("user_id", userId)
    .maybeSingle();

  const meta = (stateRow?.metadata && typeof stateRow.metadata === "object"
    ? stateRow.metadata
    : {}) as Record<string, unknown>;

  const fromTree = skillKeysFromSkillTreeMetadata(meta);
  if (fromTree.length > 0) return fromTree;

  const { data: inProg } = await sb
    .from("user_skills")
    .select("skill_key")
    .eq("user_id", userId)
    .eq("in_progress", true);

  const keys1 = (inProg ?? []).map(r => r.skill_key as string);
  if (keys1.length > 0) return uniqueStrings(keys1);

  const { data: unlocked } = await sb
    .from("user_skills")
    .select("skill_key")
    .eq("user_id", userId)
    .eq("unlocked", true)
    .limit(8);

  return uniqueStrings((unlocked ?? []).map(r => r.skill_key as string));
}
