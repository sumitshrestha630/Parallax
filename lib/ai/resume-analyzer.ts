import OpenAI from "openai";
import type { ResumeAnalysisResult, TargetRole } from "@/types/resume";

// ── Role → required skills mapping ─────────────────────────────────────────
const ROLE_SKILLS: Record<TargetRole, string[]> = {
  software_engineer: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "REST APIs", "Testing", "Node.js", "SQL"],
  frontend_developer: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "REST APIs", "Testing", "Responsive Design"],
  backend_developer: ["REST APIs", "Databases", "SQL", "Authentication", "Node.js", "Git", "Docker", "System Design"],
  data_analyst: ["SQL", "Excel", "Python", "Data Visualization", "Statistics", "Pandas", "Tableau", "A/B Testing"],
  ux_designer: ["Figma", "Design Systems", "Wireframing", "Prototyping", "User Research", "Usability Testing", "Typography", "Accessibility"],
  product_manager: ["Communication", "Roadmapping", "Analytics", "User Research", "Prioritization", "A/B Testing", "Stakeholder Management"],
};

// ── Skill → Skill Tree node mapping ────────────────────────────────────────
const SKILL_TO_NODE: Record<string, string> = {
  "HTML": "html_css",
  "CSS": "html_css",
  "JavaScript": "js_basics",
  "TypeScript": "js_basics",
  "React": "react",
  "Git": "git",
  "REST APIs": "apis",
  "Testing": "testing",
  "Node.js": "nodejs",
  "SQL": "sql",
  "System Design": "sys_design",
  "Databases": "sql",
  "Docker": "sys_design",
  "Data Visualization": "viz",
  "Statistics": "stats",
  "Pandas": "pandas",
  "Python": "python_da",
  "Excel": "excel",
  "Tableau": "bi_tools",
  "A/B Testing": "ab_testing",
  "Figma": "figma",
  "Design Systems": "design_sys",
  "Wireframing": "wireframe",
  "Prototyping": "proto",
  "User Research": "research",
  "Usability Testing": "usability",
  "Typography": "typography",
  "Accessibility": "typography",
  "Communication": "web_found",
  "Roadmapping": "sys_design",
  "Analytics": "ab_testing",
  "Prioritization": "sys_design",
};

function buildPrompt(resumeText: string, targetRole: TargetRole): string {
  const requiredSkills = ROLE_SKILLS[targetRole] ?? [];
  const roleLabel = targetRole.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return `You are a senior career coach and technical recruiter. Analyze the following resume for a ${roleLabel} role.

Required skills for ${roleLabel}: ${requiredSkills.join(", ")}

Resume:
---
${resumeText}
---

Analyze this resume and return a JSON object with EXACTLY this structure (no extra text, no markdown, just valid JSON):
{
  "score": <integer 0-100 based on how well the resume matches ${roleLabel} requirements>,
  "feedbackSummary": "<2-3 motivational but honest sentences summarizing the overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "missingSkills": ["<skill from the required list that is absent or weak>", ...],
  "improvements": ["<specific actionable improvement>", ...],
  "recommendedNodes": ["<skill node id>", ...],
  "recommendedTasks": [
    {
      "title": "<specific task to close the skill gap>",
      "difficulty": "<easy|medium|hard>",
      "relatedNode": "<skill node id>"
    }
  ]
}

For recommendedNodes, use ONLY these valid node IDs based on the missing skills:
${requiredSkills.map(s => `${s} → ${SKILL_TO_NODE[s] ?? "web_found"}`).join(", ")}

Scoring guide:
- 80-100: Strong candidate, minor polish needed
- 60-79: Solid foundation, a few key gaps
- 40-59: Decent start, significant skill gaps
- 0-39: Early stage, major gaps to address

Be realistic but motivational. Focus on actionable gaps.
Return ONLY valid JSON, no explanation outside the JSON.`;
}

// ── Main analysis function ──────────────────────────────────────────────────
// Provider: OpenAI (set OPENAI_API_KEY in .env.local)
export async function analyzeResumeWithAI(
  resumeText: string,
  targetRole: TargetRole
): Promise<ResumeAnalysisResult> {
  return analyzeWithOpenAI(resumeText, targetRole);
}

async function analyzeWithOpenAI(
  resumeText: string,
  targetRole: TargetRole
): Promise<ResumeAnalysisResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildPrompt(resumeText, targetRole);

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });

  const text = resp.choices[0]?.message?.content ?? "";
  return parseAIResponse(text);
}

function parseAIResponse(text: string): ResumeAnalysisResult {
  // Strip markdown code fences if Claude wraps in ```json
  const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(clean) as ResumeAnalysisResult;

  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    feedbackSummary: parsed.feedbackSummary ?? "",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    recommendedNodes: Array.isArray(parsed.recommendedNodes) ? parsed.recommendedNodes : [],
    recommendedTasks: Array.isArray(parsed.recommendedTasks) ? parsed.recommendedTasks : [],
  };
}

// ── Individual helpers (exported for potential reuse) ───────────────────────
export function mapMissingSkillsToNodes(missingSkills: string[]): string[] {
  const nodes = missingSkills
    .map(s => SKILL_TO_NODE[s])
    .filter(Boolean) as string[];
  return [...new Set(nodes)];
}

export function getRequiredSkillsForRole(role: TargetRole): string[] {
  return ROLE_SKILLS[role] ?? [];
}
