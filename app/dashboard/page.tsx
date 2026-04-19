import { createClient }     from "@/lib/supabase/server";
import { redirect }          from "next/navigation";
import { DashboardShell }    from "@/components/dashboard/DashboardShell";

/** Cookie/session reads must not be statically prerendered. */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");
  if (!user.user_metadata?.onboarding_complete) redirect("/onboarding");

  return <DashboardShell user={user} />;
}
