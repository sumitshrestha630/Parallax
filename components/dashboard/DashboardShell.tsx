/**
 * DashboardShell – server component.
 *
 * Fetches all Supabase data for the authenticated user and hands it down
 * to the client-side Dashboard component.  Keeping the fetch here means
 * the client component hydrates with data already present (no loading flash).
 */

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/supabase/queries";
import {
  serializeDashboardDataForClient,
  serializeUserForClient,
} from "@/lib/dashboard/client-serialization";
import { Dashboard } from "@/components/ui/dashboard";
import type { DashboardData } from "@/types/dashboard";

interface DashboardShellProps {
  user: User;
}

const emptyDashboard: DashboardData = {
  profile: null,
  items: [],
  skills: [],
  achievements: [],
  state: null,
};

export async function DashboardShell({ user }: DashboardShellProps) {
  const supabase = await createClient();
  let data: DashboardData = emptyDashboard;
  try {
    data = await getDashboardData(supabase, user.id);
  } catch {
    data = emptyDashboard;
  }

  return (
    <Dashboard
      user={serializeUserForClient(user)}
      dashboardData={serializeDashboardDataForClient(data)}
    />
  );
}
