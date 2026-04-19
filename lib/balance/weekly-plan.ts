import type { BalanceInsight, WeeklyPlan } from "@/types/balance";

/**
 * Derives a simple actionable plan from insights (deterministic, easy to extend with ML later).
 */
export function computeWeeklyPlan(insight: BalanceInsight): WeeklyPlan {
  const { freeEvenings, heavyAcademicDays } = insight;

  const shortLessons  = Math.min(7, Math.max(2, Math.round(freeEvenings * 0.5) + 2));
  const practiceTasks = Math.min(10, Math.max(3, 5 - heavyAcademicDays + 3));
  const projects      = heavyAcademicDays >= 3 ? 0 : Math.min(2, Math.max(0, 2 - heavyAcademicDays));

  return { shortLessons, practiceTasks, projects };
}
