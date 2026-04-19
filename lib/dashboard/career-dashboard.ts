/**
 * Resolves the user's chosen career for dashboard UI (CPU focus, copy, widgets)
 * and maps each career track to a primary `user_skills.skill_key` on the career map.
 *
 * Priority (why): `user_dashboard_state.selected_path` is inserted at signup and often
 * defaults to `software_engineer` before onboarding writes `goal` — so we must not prefer
 * it over onboarding. Persisted skill-tree `lastTrackId` reflects an explicit in-app choice.
 */

import type { UserDashboardState } from "@/types/dashboard";
import { getTrack, parseSkillTreePersisted, type CareerTrack } from "@/lib/skill-tree-data";

export type DashTaskRec = {
  id: string;
  title: string;
  sub: string;
  xp: number;
  diff: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  mins: number;
  icon: string;
};

/** Which CPU map node (`skill_key`) highlights the user's focus for this career track. */
const CPU_FOCUS_BY_TRACK: Record<string, string> = {
  software_engineer: "frontend",
  data_scientist: "databases",
  ux_designer: "frontend",
  product_manager: "projects",
  cybersecurity: "networking",
  cloud_engineer: "cloud",
};

export function cpuFocusSkillForCareer(trackId: string): string {
  return CPU_FOCUS_BY_TRACK[trackId] ?? "frontend";
}

/**
 * Canonical career id: skill-tree tab (if persisted) → onboarding goal → DB column.
 */
export function resolveCareerRawPath(
  dashboardState: UserDashboardState | null | undefined,
  onboardingGoal: string | null | undefined
): string | undefined {
  const persisted = parseSkillTreePersisted(dashboardState?.metadata ?? null);
  let fromTree = persisted?.lastTrackId?.trim();
  const fromOnboarding = onboardingGoal?.trim();
  const fromDb = dashboardState?.selected_path?.trim();

  /** Ignore autosaved generic tree when onboarding clearly picked a non-SWE path. */
  if (
    fromTree === "software_engineer" &&
    fromOnboarding &&
    getTrack(fromOnboarding).id !== "software_engineer"
  ) {
    fromTree = undefined;
  }

  return fromTree || fromOnboarding || fromDb || undefined;
}

export function resolveDashboardCareer(
  dashboardState: UserDashboardState | null | undefined,
  onboardingGoal: string | null | undefined
): { track: CareerTrack; cpuFocusSkillKey: string } {
  const raw = resolveCareerRawPath(dashboardState, onboardingGoal);
  const track = getTrack(raw);
  return {
    track,
    cpuFocusSkillKey: cpuFocusSkillForCareer(track.id),
  };
}

const RECOMMENDED_DEFAULT: DashTaskRec[] = [
  { id: "1", title: "Learn Python Basics", sub: "Step 1 · BEGINNER", xp: 10, diff: "BEGINNER", mins: 15, icon: "📜" },
  { id: "2", title: "Build a Mini Project", sub: "INTERMEDIATE", xp: 50, diff: "INTERMEDIATE", mins: 45, icon: "🧰" },
  { id: "3", title: "Solve Array Problems", sub: "INTERMEDIATE", xp: 30, diff: "INTERMEDIATE", mins: 25, icon: "⚡" },
];

const RECOMMENDED_BY_TRACK: Record<string, DashTaskRec[]> = {
  software_engineer: RECOMMENDED_DEFAULT,
  data_scientist: [
    { id: "da1", title: "SQL drills (JOINs & GROUP BY)", sub: "Foundations · BEGINNER", xp: 20, diff: "BEGINNER", mins: 30, icon: "🗃️" },
    { id: "da2", title: "Pandas EDA on a real CSV", sub: "INTERMEDIATE", xp: 40, diff: "INTERMEDIATE", mins: 40, icon: "🐼" },
    { id: "da3", title: "Build a KPI dashboard", sub: "INTERMEDIATE", xp: 35, diff: "INTERMEDIATE", mins: 35, icon: "📈" },
  ],
  ux_designer: [
    { id: "ux1", title: "Heuristic evaluation of one app", sub: "BEGINNER", xp: 15, diff: "BEGINNER", mins: 25, icon: "🔍" },
    { id: "ux2", title: "High-fidelity screen in Figma", sub: "INTERMEDIATE", xp: 45, diff: "INTERMEDIATE", mins: 50, icon: "🖌️" },
    { id: "ux3", title: "Micro usability test (3 users)", sub: "INTERMEDIATE", xp: 35, diff: "INTERMEDIATE", mins: 60, icon: "📝" },
  ],
  product_manager: [
    { id: "pm1", title: "Write a one-pager PRD", sub: "BEGINNER", xp: 20, diff: "BEGINNER", mins: 30, icon: "📄" },
    { id: "pm2", title: "Prioritize a backlog with RICE", sub: "INTERMEDIATE", xp: 35, diff: "INTERMEDIATE", mins: 35, icon: "📊" },
    { id: "pm3", title: "Ship a tiny feature end-to-end", sub: "INTERMEDIATE", xp: 50, diff: "INTERMEDIATE", mins: 90, icon: "🚀" },
  ],
  cybersecurity: [
    { id: "cy1", title: "Set up a home lab (VM + Kali)", sub: "BEGINNER", xp: 25, diff: "BEGINNER", mins: 45, icon: "🖥️" },
    { id: "cy2", title: "OWASP Top 10 deep read", sub: "INTERMEDIATE", xp: 30, diff: "INTERMEDIATE", mins: 40, icon: "🛡️" },
    { id: "cy3", title: "Solve 10 Bandit levels", sub: "INTERMEDIATE", xp: 40, diff: "INTERMEDIATE", mins: 50, icon: "🔐" },
  ],
  cloud_engineer: [
    { id: "cl1", title: "Deploy a static site to a bucket", sub: "BEGINNER", xp: 20, diff: "BEGINNER", mins: 35, icon: "☁️" },
    { id: "cl2", title: "Dockerfile + CI build pipeline", sub: "INTERMEDIATE", xp: 45, diff: "INTERMEDIATE", mins: 55, icon: "🐳" },
    { id: "cl3", title: "Terraform: one VPC + subnet", sub: "INTERMEDIATE", xp: 40, diff: "INTERMEDIATE", mins: 60, icon: "🏗️" },
  ],
};

const SIDEBAR_DEFAULT: DashTaskRec[] = [
  { id: "a", title: "Build a Mini Project", sub: "", xp: 50, diff: "INTERMEDIATE", mins: 45, icon: "🧰" },
  { id: "b", title: "CSS Grid Layout", sub: "", xp: 20, diff: "BEGINNER", mins: 20, icon: "🎨" },
];

const SIDEBAR_BY_TRACK: Record<string, DashTaskRec[]> = {
  software_engineer: SIDEBAR_DEFAULT,
  data_scientist: [
    { id: "dsa", title: "Window functions mini-set", sub: "", xp: 25, diff: "INTERMEDIATE", mins: 30, icon: "🗄️" },
    { id: "dsb", title: "Plotly chart from a dataset", sub: "", xp: 22, diff: "BEGINNER", mins: 25, icon: "📉" },
  ],
  ux_designer: [
    { id: "uxa", title: "Mobile nav redesign", sub: "", xp: 28, diff: "INTERMEDIATE", mins: 40, icon: "📱" },
    { id: "uxb", title: "Accessibility pass (WCAG)", sub: "", xp: 24, diff: "INTERMEDIATE", mins: 35, icon: "♿" },
  ],
  product_manager: [
    { id: "pma", title: "Competitive teardown doc", sub: "", xp: 26, diff: "BEGINNER", mins: 35, icon: "🔭" },
    { id: "pmb", title: "Roadmap slide for one quarter", sub: "", xp: 30, diff: "INTERMEDIATE", mins: 40, icon: "🗺️" },
  ],
  cybersecurity: [
    { id: "cya", title: "Wireshark basics lab", sub: "", xp: 28, diff: "BEGINNER", mins: 40, icon: "📡" },
    { id: "cyb", title: "Patch Tuesday read + notes", sub: "", xp: 18, diff: "BEGINNER", mins: 20, icon: "📰" },
  ],
  cloud_engineer: [
    { id: "cla", title: "Serverless hello function", sub: "", xp: 30, diff: "BEGINNER", mins: 35, icon: "⚡" },
    { id: "clb", title: "IAM least-privilege exercise", sub: "", xp: 28, diff: "INTERMEDIATE", mins: 45, icon: "🔑" },
  ],
};

const BALANCE_TIP_BY_TRACK: Record<string, string> = {
  software_engineer: "You have a heavy school week coming up. Try a lighter task today.",
  data_scientist: "Short SQL reps beat long cram sessions — 20 focused minutes daily compounds.",
  ux_designer: "Critique one real screen today; ship pixels tomorrow.",
  product_manager: "Write one crisp problem statement before touching solutions.",
  cybersecurity: "Labs > lectures — carve 30 minutes for hands-on reps.",
  cloud_engineer: "Destroy test resources after each lab so billing and habits stay clean.",
};

export function recommendedForTrack(trackId: string): DashTaskRec[] {
  return RECOMMENDED_BY_TRACK[trackId] ?? RECOMMENDED_DEFAULT;
}

export function sidebarTasksForTrack(trackId: string): DashTaskRec[] {
  return SIDEBAR_BY_TRACK[trackId] ?? SIDEBAR_DEFAULT;
}

export function balanceTipForTrack(trackId: string): string {
  return BALANCE_TIP_BY_TRACK[trackId] ?? BALANCE_TIP_BY_TRACK.software_engineer;
}
