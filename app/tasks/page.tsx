import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TasksStandaloneLayout } from "@/components/dashboard/TasksStandaloneLayout";
import type { TasksUrlHandoff } from "@/types/dashboard";
import { inferSkillKeyForTreeNode } from "@/lib/dashboard/skill-tree-node-tasks";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function TasksRoutePage({ searchParams }: { searchParams: Promise<SP> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/tasks");
  if (!user.user_metadata?.onboarding_complete) redirect("/onboarding");

  const sp = await searchParams;
  const node = first(sp.node)?.trim();
  const skillRaw = first(sp.skill)?.trim();
  const label = first(sp.label)?.trim();
  const source = first(sp.source)?.trim();

  let urlHandoff: TasksUrlHandoff | null = null;
  if (node) {
    const skillLane = skillRaw || inferSkillKeyForTreeNode(node);
    urlHandoff = {
      skillLane,
      nodeId: node,
      ...(label ? { nodeLabel: label } : {}),
      ...(source ? { source } : {}),
    };
  }

  return <TasksStandaloneLayout urlHandoff={urlHandoff} />;
}
