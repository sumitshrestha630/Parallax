/**
 * Curated suggested tasks keyed by Skill Tree node ids (`lib/skill-tree-data.ts`).
 * Aliases (e.g. web_foundations → web_found) normalize user-facing keys to canonical ids.
 */

import type { SuggestedTask, SuggestedDifficulty } from "@/types/suggested-task";
import { inferSkillKeyForTreeNode } from "@/lib/dashboard/skill-tree-node-tasks";

/** Maps onboarding-style names → canonical tree node ids. Extend when marketing copy diverges. */
export const SKILL_NODE_ALIASES: Record<string, string> = {
  web_foundations: "web_found",
  foundations_web: "web_found",
  html: "html_css",
  css: "html_css",
  javascript: "js_basics",
  js: "js_basics",
  nextjs: "fullstack",
  next_js: "fullstack",
  python: "python_da",
  ai_ml: "ml_basics",
  ai: "ml_basics",
  ml: "ml_basics",
  database: "sql",
  databases: "sql",
  sql_only: "sql_da",
  networking: "apis",
};

function mk(
  lane: string,
  nodeId: string,
  index: number,
  partial: Omit<SuggestedTask, "task_key" | "skill_key" | "node_id">
): SuggestedTask {
  return {
    task_key: `suggested__${nodeId}__${index}`,
    skill_key: lane,
    node_id: nodeId,
    ...partial,
  };
}

/** Normalize alias or pass-through canonical node id */
export function normalizeSkillTreeNodeKey(raw: string): string {
  const t = raw.trim().toLowerCase().replace(/\s+/g, "_");
  return SKILL_NODE_ALIASES[t] ?? SKILL_NODE_ALIASES[raw.trim()] ?? raw.trim();
}

export type TaskCategory =
  | "web"
  | "frontend_framework"
  | "backend"
  | "data_sql"
  | "python_ai"
  | "design_ux"
  | "product"
  | "projects"
  | "devops_cloud"
  | "general";

export function getTaskCategoryForSkill(skillKeyOrNodeId: string): TaskCategory {
  const id = normalizeSkillTreeNodeKey(skillKeyOrNodeId);
  if (["web_found", "html_css", "js_basics", "git"].includes(id)) return "web";
  if (["react", "fullstack"].includes(id)) return "frontend_framework";
  if (["nodejs", "apis", "testing", "dsa", "sys_design", "oss"].includes(id)) return "backend";
  if (["sql", "sql_da", "data_found", "excel", "pandas", "stats", "viz", "bi_tools", "dashboards"].includes(id))
    return "data_sql";
  if (["python_da", "ml_basics", "ab_testing", "capstone_da", "portfolio_da"].includes(id)) return "python_ai";
  if (
    id.startsWith("design_") ||
    ["principles", "figma", "research", "wireframe", "proto", "typography", "ia", "design_sys", "usability", "motion", "portfolio_ux", "casestudy"].includes(id)
  )
    return "design_ux";
  if (["fullstack", "capstone_da", "portfolio_ux", "portfolio_da", "casestudy"].includes(id)) return "projects";
  return "general";
}

function adjustForLevel(base: SuggestedDifficulty, level: number): SuggestedDifficulty {
  if (level <= 1) return base === "hard" ? "medium" : base;
  if (level >= 4) return base === "easy" ? "medium" : "hard";
  return base;
}

function bumpXp(base: number, level: number): number {
  return Math.round(base * (1 + Math.min(level, 5) * 0.06));
}

export function getFallbackTasksForSkill(
  lane: string,
  nodeId: string,
  label = "this skill"
): SuggestedTask[] {
  const titleCase = label.replace(/_/g, " ");
  return [
    mk(lane, nodeId, 0, {
      title: `${titleCase}: foundations checklist`,
      description: `Skim core concepts for ${titleCase}, then write down what you already know vs what’s new.`,
      difficulty: "easy",
      xp_reward: 15,
      estimated_minutes: 25,
      learning_objective: `Build a mental model of how ${titleCase} fits your path.`,
      instructions: [
        `List 5 terms or ideas central to ${titleCase}.`,
        "Watch or read one trusted intro resource (30 min max).",
        "Summarize in 5 bullets what you will practice next.",
        "Pick one bullet to turn into your next hands-on session.",
      ],
    }),
    mk(lane, nodeId, 1, {
      title: `Mini build: practice ${titleCase}`,
      description: `Ship a tiny artifact that proves you applied ${titleCase} — scope it so you can finish in one sitting.`,
      difficulty: "medium",
      xp_reward: 35,
      estimated_minutes: 60,
      learning_objective: `Translate theory into one concrete deliverable for ${titleCase}.`,
      instructions: [
        "Define success in one sentence.",
        "Implement the smallest version that still demonstrates the skill.",
        "Record a screenshot, snippet, or repo link as evidence.",
        "Reflect: what would you refine next?",
      ],
    }),
    mk(lane, nodeId, 2, {
      title: `${titleCase}: review & teach-back`,
      description: `Explain ${titleCase} as if to a peer — gaps in your explanation reveal what to study next.`,
      difficulty: "easy",
      xp_reward: 20,
      estimated_minutes: 30,
      learning_objective: "Solidify understanding through articulation.",
      instructions: [
        "Draft a 2-minute spoken outline (bullet notes).",
        "Cover why it matters, one example, and one pitfall.",
        "Optionally record voice memo or pair with a friend.",
      ],
    }),
  ];
}

/** Curated packs per canonical node id (software engineer track + shared nodes). */
const CURATED: Record<string, Omit<SuggestedTask, "task_key" | "skill_key" | "node_id">[]> = {
  web_found: [
    {
      title: "Build your first HTML page",
      description: "Create a complete HTML document from scratch — structure it correctly and open it in a browser.",
      difficulty: "easy",
      xp_reward: 25,
      estimated_minutes: 30,
      learning_objective: "Understand the skeleton of every web page: DOCTYPE, html, head, body.",
      instructions: [
        "Create a file called index.html and add the DOCTYPE declaration at the top.",
        "Add <html>, <head>, and <body> tags with proper nesting.",
        "Inside <head>, add a <title> and a <meta charset=’UTF-8’> tag.",
        "Inside <body>, add an <h1> heading, a <p> paragraph, and an <a> link.",
        "Open the file in your browser and confirm it renders correctly.",
      ],
    },
    {
      title: "Style a page with CSS",
      description: "Link an external CSS file and apply styles — colors, fonts, spacing, and a simple layout.",
      difficulty: "easy",
      xp_reward: 30,
      estimated_minutes: 40,
      learning_objective: "Connect CSS to HTML and apply the box model: margin, border, padding, width.",
      instructions: [
        "Create styles.css and link it from your HTML using <link rel=’stylesheet’>.",
        "Set a background color, font-family, and base font-size on the body.",
        "Add padding and a max-width to a container div to center the content.",
        "Style your heading with a different color and your paragraph with line-height.",
        "Use the browser DevTools to inspect elements and tweak values live.",
      ],
    },
    {
      title: "Add JavaScript interactivity",
      description: "Make the page respond to user actions — click a button and see the page change.",
      difficulty: "easy",
      xp_reward: 35,
      estimated_minutes: 35,
      learning_objective: "Select DOM elements and update them in response to events.",
      instructions: [
        "Create script.js and link it at the bottom of your <body>.",
        "Add a <button> to your HTML with an id you can target.",
        "Use document.getElementById() to select the button in JavaScript.",
        "Add an addEventListener(‘click’, ...) that changes a heading’s text when clicked.",
        "Test in the browser and check the console for any errors.",
      ],
    },
    {
      title: "Make it responsive",
      description: "Use CSS media queries so your page looks good on both phone and desktop screens.",
      difficulty: "medium",
      xp_reward: 40,
      estimated_minutes: 45,
      learning_objective: "Write mobile-first CSS and use breakpoints to adjust layout for larger screens.",
      instructions: [
        "Add <meta name=’viewport’ content=’width=device-width, initial-scale=1’> to your <head>.",
        "Start with mobile styles: single-column layout, full-width elements.",
        "Add a @media (min-width: 768px) block and switch to a two-column layout inside it.",
        "Test by resizing the browser window or using DevTools device mode.",
        "Ensure text stays readable and buttons stay tappable at all sizes.",
      ],
    },
    {
      title: "Trace a web request",
      description: "Open DevTools Network tab and observe what actually happens when a page loads.",
      difficulty: "easy",
      xp_reward: 20,
      estimated_minutes: 25,
      learning_objective: "Read HTTP status codes, request headers, and response payloads in the browser.",
      instructions: [
        "Open any website and press F12 to open DevTools, then go to the Network tab.",
        "Reload the page and find the first HTML document request at the top.",
        "Click it and examine the Request Headers and Response Headers.",
        "Find a request that returns a 200, one that returns a 301 or 304, and note the difference.",
        "Write down in plain English what happened from URL typed to page displayed.",
      ],
    },
  ],
  html_css: [
    {
      title: "Semantic landing section",
      description: "Build one hero + features section using semantic tags only (no div soup).",
      difficulty: "easy",
      xp_reward: 30,
      estimated_minutes: 50,
      learning_objective: "Use header/main/section/article/nav correctly for accessibility.",
      instructions: [
        "Sketch structure on paper first.",
        "Implement HTML only; validate in W3C validator.",
        "Add skip-link pattern notes if you add nav.",
      ],
    },
    {
      title: "Responsive profile card",
      description: "Card layout with flex/grid; mobile-first breakpoints.",
      difficulty: "medium",
      xp_reward: 45,
      estimated_minutes: 75,
      learning_objective: "Control layout with modern CSS without fighting floats.",
      instructions: [
        "Mobile: single column; ≥768px: optional side-by-side.",
        "Use clamp() or fluid type for title.",
        "Test in DevTools device mode.",
      ],
    },
  ],
  js_basics: [
    {
      title: "DOM micro interaction",
      description: "Toggle UI state with vanilla JS — no framework.",
      difficulty: "easy",
      xp_reward: 35,
      estimated_minutes: 55,
      learning_objective: "Wire events, query DOM, update text/styles safely.",
      instructions: [
        "HTML: button + target element.",
        "JS: addEventListener, prevent duplicate handlers.",
        "Handle edge case: rapid double-clicks.",
      ],
    },
    {
      title: "Async refactor",
      description: "Convert callback-style flow to async/await with error handling.",
      difficulty: "medium",
      xp_reward: 50,
      estimated_minutes: 70,
      learning_objective: "Comfort with promises, await, try/catch.",
      instructions: [
        "Start from provided snippet using .then chains (or write your own).",
        "Refactor to async/await.",
        "Surface failures to the user (inline message).",
      ],
    },
  ],
  react: [
    {
      title: "Composable card list",
      description: "Props-driven cards; lift filter state to parent.",
      difficulty: "medium",
      xp_reward: 55,
      estimated_minutes: 80,
      learning_objective: "Props, lists, keys, derived state.",
      instructions: [
        "Card component: title, meta, tag.",
        "Parent maps array → cards.",
        "Add client-side filter input.",
      ],
    },
    {
      title: "Data fetch + loading UX",
      description: "fetch in useEffect or route handler; show skeleton/spinner + error.",
      difficulty: "medium",
      xp_reward: 60,
      estimated_minutes: 90,
      learning_objective: "Handle async lifecycle in React.",
      instructions: [
        "Pick a public API.",
        "States: idle/loading/success/error.",
        "Avoid setting state after unmount (cleanup).",
      ],
    },
  ],
  nodejs: [
    {
      title: "REST resource stub",
      description: "Express/Fastify route with validation stub for POST body.",
      difficulty: "medium",
      xp_reward: 55,
      estimated_minutes: 85,
      learning_objective: "Structure routes, parse JSON, return consistent errors.",
      instructions: [
        "POST /items accepts { title }; validate non-empty.",
        "Return 201 + created id.",
        "404 on GET unknown id.",
      ],
    },
  ],
  sql: [
    {
      title: "Schema + seed",
      description: "Two related tables, FK, seed 10 rows, write 3 joins.",
      difficulty: "medium",
      xp_reward: 50,
      estimated_minutes: 75,
      learning_objective: "Model relationships and join fluency.",
      instructions: [
        "Pick domain (tasks/users or books/authors).",
        "Write CREATE TABLE with constraints.",
        "INSERT seed; SELECT with INNER JOIN + aggregate.",
      ],
    },
  ],
  apis: [
    {
      title: "Versioned API slice",
      description: "Prefix /v1, consistent error JSON, pagination query params.",
      difficulty: "hard",
      xp_reward: 70,
      estimated_minutes: 100,
      learning_objective: "Production-shaped API ergonomics.",
      instructions: [
        "Define error schema { code, message }.",
        "Add limit/offset with sane defaults.",
        "Document routes in README.",
      ],
    },
  ],
  fullstack: [
    {
      title: "Vertical slice feature",
      description: "One user-visible flow touching UI + API + persistence.",
      difficulty: "hard",
      xp_reward: 85,
      estimated_minutes: 120,
      learning_objective: "Ship end-to-end with clear boundaries.",
      instructions: [
        "Pick a tiny feature (e.g. create + list comments).",
        "API + DB migration or ORM model.",
        "UI form + optimistic or refresh pattern.",
      ],
    },
  ],
  git: [
    {
      title: "Branch + PR hygiene",
      description: "Feature branch, meaningful commits, open PR with checklist.",
      difficulty: "easy",
      xp_reward: 25,
      estimated_minutes: 40,
      learning_objective: "Professional collaboration basics.",
      instructions: [
        "Create branch feature/<short-name>.",
        "At least 3 atomic commits.",
        "PR description: what/why/test plan.",
      ],
    },
  ],
  dsa: [
    {
      title: "Pattern of the week",
      description: "Pick one pattern (hash map, two pointers, sliding window) — solve 3 easies.",
      difficulty: "medium",
      xp_reward: 55,
      estimated_minutes: 90,
      learning_objective: "Deliberate reps beat random grinding.",
      instructions: [
        "Watch one short explainer on the pattern.",
        "Solve 3 problems tagging the pattern.",
        "Write complexity notes for each.",
      ],
    },
  ],
  testing: [
    {
      title: "Critical path tests",
      description: "Cover pure logic + one integration test for API route/handler.",
      difficulty: "medium",
      xp_reward: 50,
      estimated_minutes: 80,
      learning_objective: "Fast feedback loop with meaningful assertions.",
      instructions: [
        "Identify pure function → unit tests with edge cases.",
        "Add supertest or equivalent for one route.",
        "CI: npm test exits 0.",
      ],
    },
  ],
  sys_design: [
    {
      title: "Scale sketch",
      description: "Pick a classic prompt (URL shortener, chat); draw boxes + bottlenecks.",
      difficulty: "hard",
      xp_reward: 75,
      estimated_minutes: 90,
      learning_objective: "Articulate tradeoffs, not buzzwords.",
      instructions: [
        "Clarify functional + non-functional requirements.",
        "Draw clients, LB, app, cache, DB, queue.",
        "Call out single biggest risk and mitigation.",
      ],
    },
  ],
  oss: [
    {
      title: "Good first issue path",
      description: "Find an issue, reproduce, patch, open PR — even tiny docs fix counts.",
      difficulty: "medium",
      xp_reward: 45,
      estimated_minutes: 120,
      learning_objective: "Navigate foreign codebase courteously.",
      instructions: [
        "Read CONTRIBUTING.md.",
        "Comment intent on issue.",
        "Small PR; respond to review promptly.",
      ],
    },
  ],
};

function materialize(nodeId: string, lane: string): SuggestedTask[] {
  const rows = CURATED[nodeId];
  if (!rows) return [];
  return rows.map((r, i) => mk(lane, nodeId, i, r));
}

function applyLevel(tasks: SuggestedTask[], level = 1): SuggestedTask[] {
  return tasks.map(t => ({
    ...t,
    difficulty: adjustForLevel(t.difficulty, level),
    xp_reward: bumpXp(t.xp_reward, level),
  }));
}

/**
 * Returns curated suggested tasks for a Skill Tree node id or alias.
 * `skillKeyOrNodeId` should be the **tree node id** (e.g. `react`) or an alias (`javascript` → `js_basics`).
 * For DB task lane only, pass any node from that lane still gets curated via node id — prefer passing **node** query param from UI.
 */
export function getSuggestedTasksForSkill(skillKeyOrNodeId: string, level?: number): SuggestedTask[] {
  const lv = level ?? 1;
  const normalized = normalizeSkillTreeNodeKey(skillKeyOrNodeId);
  const lane = inferSkillKeyForTreeNode(normalized);

  let tasks = materialize(normalized, lane);
  if (tasks.length === 0) {
    tasks = getFallbackTasksForSkill(lane, normalized, normalized.replace(/_/g, " "));
  }
  return applyLevel(tasks, lv);
}
