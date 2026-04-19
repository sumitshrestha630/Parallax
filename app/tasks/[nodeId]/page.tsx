import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TasksNodeStandaloneLayout } from "@/components/dashboard/TasksNodeStandaloneLayout";
import { inferSkillKeyForTreeNode } from "@/lib/dashboard/skill-tree-node-tasks";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function TaskForNodePage({
  params,
  searchParams,
}: {
  params: Promise<{ nodeId: string }>;
  searchParams: Promise<SP>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { nodeId: rawNodeId } = await params;
  const nodeId = decodeURIComponent(rawNodeId);

  const pathForLogin = `/tasks/${encodeURIComponent(nodeId)}`;

  if (!user) redirect(`/login?next=${encodeURIComponent(pathForLogin)}`);
  if (!user.user_metadata?.onboarding_complete) redirect("/onboarding");

  const sp = await searchParams;
  const skillRaw = first(sp.skill)?.trim();
  const label = first(sp.label)?.trim();
  const source = first(sp.source)?.trim();

  const skillLane = skillRaw || inferSkillKeyForTreeNode(nodeId);

  return (
    <TasksNodeStandaloneLayout
      nodeId={nodeId}
      skillLane={skillLane}
      {...(label ? { nodeLabel: label } : {})}
      {...(source ? { source } : {})}
    />
  );
}
