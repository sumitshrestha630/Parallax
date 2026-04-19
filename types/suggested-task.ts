/**
 * Curated practice tasks for Skill Tree → Tasks hand-off (not necessarily rows in `tasks` table).
 */

export type SuggestedDifficulty = "easy" | "medium" | "hard";

export type SuggestedTask = {
  task_key: string;
  /** Task lane used by Supabase (`frontend` | `backend` | `databases`) — see `inferSkillKeyForTreeNode`. */
  skill_key: string;
  /** Canonical Skill Tree node id (e.g. `web_found`, `react`) when task is node-specific. */
  node_id?: string;
  title: string;
  description: string;
  difficulty: SuggestedDifficulty;
  xp_reward: number;
  estimated_minutes: number;
  learning_objective: string;
  instructions: string[];
};
