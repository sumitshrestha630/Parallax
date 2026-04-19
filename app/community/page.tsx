import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CommunityHub } from "@/components/community/CommunityHub";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/community");
  if (!user.user_metadata?.onboarding_complete) redirect("/onboarding");

  return <CommunityHub user={user} />;
}
