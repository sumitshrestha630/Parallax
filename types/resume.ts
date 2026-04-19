export interface ResumeAnalysisResult {
  score: number;
  feedbackSummary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  improvements: string[];
  recommendedNodes: string[];
  recommendedTasks: ResumeRecommendedTask[];
}

export interface ResumeRecommendedTask {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  relatedNode: string;
}

export type TargetRole =
  | "software_engineer"
  | "data_analyst"
  | "ux_designer"
  | "product_manager"
  | "backend_developer"
  | "frontend_developer";

export const TARGET_ROLE_LABELS: Record<TargetRole, string> = {
  software_engineer: "Software Engineer",
  data_analyst: "Data Analyst",
  ux_designer: "UI/UX Designer",
  product_manager: "Product Manager",
  backend_developer: "Backend Developer",
  frontend_developer: "Frontend Developer",
};

export interface SavedResumeAnalysis {
  id: string;
  user_id: string;
  target_role: string;
  score: number;
  result: ResumeAnalysisResult;
  created_at: string;
}
