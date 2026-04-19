// ── Database row shapes ───────────────────────────────────────────────────────

export interface Profile {
  id:         string;
  username:   string | null;
  email:      string | null;
  created_at: string;
}

export interface DashboardComponent {
  id:            string;
  key:           string;
  name:          string;
  category:      string | null;
  default_props: Record<string, unknown>;
  created_at:    string;
}

export interface UserDashboardItem {
  id:            string;
  user_id:       string;
  component_key: string;
  props:         Record<string, unknown>;
  layout:        DashboardItemLayout;
  visible:       boolean;
  sort_order:    number;
  created_at:    string;
  updated_at:    string;
}

export interface DashboardItemLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UserSkill {
  id:         string;
  user_id:    string;
  skill_key:  string;
  skill_name: string;
  level:      number;
  xp:         number;
  unlocked:   boolean;
  in_progress?: boolean;
  completed?:   boolean;
  metadata:   SkillMetadata;
  updated_at: string;
}

/** Shape of the `metadata` JSON column in user_skills */
export interface SkillMetadata {
  ex:           number;   // SVG endpoint x (viewBox 0 0 300 150)
  ey:           number;   // SVG endpoint y
  color:        string;   // hex accent
  dashDuration: string;   // CSS animation duration e.g. "2.0s"
  path:         string;   // SVG orthogonal path string
  [key: string]: unknown;
}

export interface UserAchievement {
  id:          string;
  user_id:     string;
  badge_key:   string;
  title:       string;
  description: string | null;
  unlocked_at: string;
}

export interface UserDashboardState {
  id:                string;
  user_id:           string;
  theme:             string;
  active_avatar:     string | null;
  selected_path:     string;
  sidebar_collapsed: boolean;
  metadata:          Record<string, unknown>;
  updated_at:        string;
}

// ── Aggregated load shape ─────────────────────────────────────────────────────

export interface DashboardData {
  profile:      Profile | null;
  items:        UserDashboardItem[];
  skills:       UserSkill[];
  achievements: UserAchievement[];
  state:        UserDashboardState | null;
  taskSummary?: TaskSummary;
}

// ── Tasks / skill catalogs ────────────────────────────────────────────────────

export interface SkillCatalogItem {
  id:               string;
  skill_key:        string;
  skill_name:       string;
  category:         string | null;
  description:      string | null;
  parent_skill_key: string | null;
  metadata:         Record<string, unknown>;
  created_at:       string;
}

export interface TaskCatalogItem {
  id:                string;
  task_key:          string;
  title:             string;
  description:       string | null;
  skill_key:         string;
  difficulty:        string | null;
  xp_reward:         number;
  estimated_minutes: number | null;
  task_type:         string | null;
  order_index:       number;
  metadata:          Record<string, unknown>;
  created_at:        string;
}

export type ResourceProvider = "YouTube" | "GitHub" | "DB";
export type ResourceType = "youtube" | "github" | "course" | "article" | "repo";

export interface TaskResource {
  id?: string;
  task_key: string;
  resource_type: ResourceType;
  title: string;
  url: string;
  provider: ResourceProvider;
  skill_key: string;
  metadata: Record<string, unknown>;
  created_at?: string;
}

export interface Course {
  id: string;
  course_key: string;
  title: string;
  provider: string | null;
  url: string | null;
  skill_key: string;
  difficulty: string | null;
  duration: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type UserTaskStatus = "locked" | "available" | "in_progress" | "completed";

export interface UserTask {
  id:           string;
  user_id:      string;
  task_key:     string;
  skill_key:    string;
  status:       UserTaskStatus;
  progress:     number;
  completed:    boolean;
  assigned_at:  string;
  completed_at: string | null;
  xp_earned:    number;
  metadata:     Record<string, unknown>;
}

export interface TaskWithUserState {
  task: TaskCatalogItem;
  userTask: UserTask;
  resources?: TaskResource[];
}

export interface TaskSummary {
  active: number;
  available: number;
  completed: number;
  xpEarned: number;
}

// ── Component registry types ──────────────────────────────────────────────────

export type ComponentKey =
  | "career_map"
  | "skill_tree"
  | "stats_card"
  | "dashboard_pills"
  | "achievement_panel"
  | "mentor_matches"
  | "roadmap_progress"
  | "task_overview"
  | "daily_tasks";

export interface DashboardContext {
  userId:       string;
  username:     string;
  /** Canonical track id (e.g. software_engineer) after resolving onboarding + dashboard state. */
  careerTrackId: string;
  /** Primary `user_skills.skill_key` highlighted on the CPU career map for this track. */
  cpuFocusSkillKey: string;
  /** Display label for the user’s career track (e.g. "Software Engineer"). */
  careerTrackLabel: string;
  skills:       UserSkill[];
  achievements: UserAchievement[];
  state:        UserDashboardState | null;
  taskSummary?: TaskSummary;
  totalXp:      number;
}

// ── Skill node shape used by CpuArchitecture ─────────────────────────────────

export type SkillNodeState = "active" | "locked";

export interface MappedSkillNode {
  id:           string;
  label:        string;
  ex:           number;
  ey:           number;
  path:         string;
  color:        string;
  state:        SkillNodeState;
  xp:           number;
  dashDuration: string;
}
