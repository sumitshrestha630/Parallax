/**
 * Balance / weekly schedule domain types.
 * Mirrors `public.user_schedule_events` and derived views.
 */

export type ScheduleEventType = "class" | "work" | "custom";
export type ScheduleIntensity = "busy" | "medium";
export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface ScheduleEvent {
  id:         string;
  user_id:    string;
  title:      string;
  type:       ScheduleEventType;
  day:        Weekday;
  start_time: string;
  end_time:   string;
  intensity:  ScheduleIntensity;
  created_at?: string;
  updated_at?: string;
}

export interface RecommendedSlot {
  id:    string;
  day:   Weekday;
  time:  string;
  label: string;
}

export interface BalanceInsight {
  heavyAcademicDays:     number;
  freeEvenings:          number;
  bestLearningWindows:   string[];
  avoidDays:             string[];
}

export interface WeeklyPlan {
  shortLessons:   number;
  practiceTasks:  number;
  projects:       number;
}

/** Calendar cell visual state */
export type CalendarCellKind = "busy" | "medium" | "free" | "recommended";
