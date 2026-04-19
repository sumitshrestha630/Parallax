import type { User } from "@supabase/supabase-js";
import type { DashboardData } from "@/types/dashboard";

/** Only normalize BigInt — do not use a "circular" WeakSet replacer: it breaks valid shared object references. */
function bigintReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

const emptyDashboard: DashboardData = {
  profile: null,
  items: [],
  skills: [],
  achievements: [],
  state: null,
};

/** Safe to pass from a Server Component into client components (Next.js flight serialization). */
export function serializeDashboardDataForClient(data: DashboardData): DashboardData {
  try {
    const o = JSON.parse(JSON.stringify(data, bigintReplacer)) as DashboardData;
    if (!o || typeof o !== "object" || !Array.isArray(o.items)) return emptyDashboard;
    return o;
  } catch {
    return emptyDashboard;
  }
}

export function serializeUserForClient(user: User): User {
  try {
    return JSON.parse(JSON.stringify(user, bigintReplacer)) as User;
  } catch {
    return {
      id: user.id,
      email: user.email ?? "",
      app_metadata: user.app_metadata ?? {},
      user_metadata: user.user_metadata ?? {},
      aud: user.aud ?? "authenticated",
      created_at: user.created_at ?? "",
      updated_at: user.updated_at ?? "",
    } as User;
  }
}
