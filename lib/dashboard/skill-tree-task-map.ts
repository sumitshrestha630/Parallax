/**
 * Maps Skill Tree node ids (lib/skill-tree-data.ts) to `user_skills.skill_key` / `tasks.skill_key`.
 * Extend as you add tasks for more skills.
 */
export const SKILL_TREE_NODE_TO_SKILL_KEY: Record<string, string> = {
  web_found: "frontend",
  html_css:  "frontend",
  js_basics: "frontend",
  git:       "projects",
  react:     "frontend",
  nodejs:    "backend",
  sql:       "databases",
  dsa:       "projects",
  apis:      "backend",
  testing:   "projects",
  sys_design: "backend",
  fullstack: "frontend",
  oss:       "projects",
};
