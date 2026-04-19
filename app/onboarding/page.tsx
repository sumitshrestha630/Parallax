import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Onboarding } from "@/components/ui/onboarding";
import { serializeUserForClient } from "@/lib/dashboard/client-serialization";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/onboarding");

  // Already completed onboarding — skip to dashboard
  if (user.user_metadata?.onboarding_complete) redirect("/dashboard");

  return <Onboarding user={serializeUserForClient(user)} />;
}
