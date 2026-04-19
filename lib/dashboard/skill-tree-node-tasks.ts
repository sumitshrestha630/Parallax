/**
 * Maps Skill Tree node ids → `tasks.skill_key` so we can load related tasks on the Tasks tab.
 * Seed tasks use skill_key frontend | backend | databases (see migrations).
 */

const FRONTEND_NODES = new Set([
  "web_found", "html_css", "js_basics", "react", "git",
  "wireframe", "proto", "figma",
  "design_found", "principles", "typography", "portfolio_ux", "casestudy",
  "motion", "usability", "research", "design_sys",
]);

const BACKEND_NODES = new Set([
  "nodejs", "apis", "fullstack", "testing",
  "dsa", // interview prep bucket → closest seeded lane
]);

const DATABASE_NODES = new Set([
  "sql",
  "data_found", "excel", "python_da", "sql_da", "pandas", "stats", "viz",
  "bi_tools", "ml_basics", "ab_testing", "dashboards", "capstone_da", "portfolio_da",
]);

export function inferSkillKeyForTreeNode(nodeId: string): string {
  if (FRONTEND_NODES.has(nodeId)) return "frontend";
  if (BACKEND_NODES.has(nodeId)) return "backend";
  if (DATABASE_NODES.has(nodeId)) return "databases";

  /* Advanced / architecture nodes — share “full stack” workload with backend bucket */
  if (nodeId === "sys_design" || nodeId === "oss") return "backend";

  return "frontend";
}
