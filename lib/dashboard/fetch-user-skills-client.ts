/**
 * Browser Supabase fetch for `user_skills` — use after mutations so the dashboard
 * XP bar / level update without relying only on `router.refresh()` RSC timing.
 */

import { createClient } from "@/lib/supabase/client";
import type { UserSkill } from "@/types/dashboard";

export async function fetchUserSkillsClient(userId: string): Promise<UserSkill[]> {
  const sb = createClient();
  const { data, error } = await sb.from("user_skills").select("*").eq("user_id", userId).order("skill_key");
  if (error) throw error;
  return (data as UserSkill[]) ?? [];
}
