import type { SupabaseClient } from "@supabase/supabase-js";
import type { TaskResource, TaskWithUserState } from "@/types/dashboard";
import { fetchYouTubeResources } from "@/lib/resources/youtube";
import { fetchGitHubProjects } from "@/lib/resources/github";

function defaultQueriesForSkill(skillKey: string, taskTitle: string): { yt: string; gh: string } {
  const base = `${skillKey} ${taskTitle}`.trim();
  switch (skillKey) {
    case "frontend":
      return { yt: `React ${taskTitle} beginner tutorial`, gh: `react ${taskTitle} stars:>200` };
    case "backend":
      return { yt: `Node.js Express ${taskTitle} tutorial`, gh: `express ${taskTitle} stars:>200` };
    case "databases":
      return { yt: `SQL ${taskTitle} tutorial`, gh: `sql ${taskTitle} stars:>200` };
    case "devops":
      return { yt: `Docker ${taskTitle} beginner`, gh: `docker ${taskTitle} stars:>200` };
    case "cloud":
      return { yt: `AWS ${taskTitle} beginner`, gh: `aws ${taskTitle} stars:>200` };
    case "aiml":
      return { yt: `machine learning ${taskTitle} beginner`, gh: `machine-learning ${taskTitle} stars:>200` };
    default:
      return { yt: `${base} tutorial`, gh: `${base} stars:>200` };
  }
}

export async function getCachedResourcesForTask(
  sb: SupabaseClient,
  taskKey: string
): Promise<TaskResource[]> {
  const { data } = await sb
    .from("task_resources")
    .select("*")
    .eq("task_key", taskKey)
    .order("created_at", { ascending: false })
    .limit(6);
  return ((data ?? []) as TaskResource[]) ?? [];
}

export async function ensureResourcesForTask(
  sb: SupabaseClient,
  task: { task_key: string; title: string; skill_key: string }
): Promise<TaskResource[]> {
  // Prefer cached DB resources.
  const cached = await getCachedResourcesForTask(sb, task.task_key);
  if (cached.length > 0) return cached;

  const { yt, gh } = defaultQueriesForSkill(task.skill_key, task.title);
  const [videos, repos] = await Promise.all([
    fetchYouTubeResources(yt, 2).catch(() => []),
    fetchGitHubProjects(gh, 2).catch(() => []),
  ]);

  const videoResources: TaskResource[] = videos.map(v => ({
      task_key: task.task_key,
      resource_type: "youtube",
      title: v.title,
      url: v.url,
      provider: "YouTube",
      skill_key: task.skill_key,
      metadata: { thumbnail: v.thumbnail, videoId: v.videoId },
    }));

  const repoResources: TaskResource[] = repos.map(r => ({
      task_key: task.task_key,
      resource_type: "github",
      title: r.title,
      url: r.url,
      provider: "GitHub",
      skill_key: task.skill_key,
      metadata: { description: r.description, stars: r.stars },
    }));

  const resources: TaskResource[] = [...videoResources, ...repoResources];

  if (resources.length === 0) return [];

  // Cache best-effort. If RLS blocks or table missing, still return fetched resources.
  try {
    await sb.from("task_resources").upsert(resources, { onConflict: "task_key,url", ignoreDuplicates: true });
  } catch {
    // ignore
  }

  return resources;
}

export async function enrichTasksWithResources(
  sb: SupabaseClient,
  rows: TaskWithUserState[]
): Promise<TaskWithUserState[]> {
  const out: TaskWithUserState[] = [];
  for (const row of rows) {
    const resources = await ensureResourcesForTask(sb, {
      task_key: row.task.task_key,
      title: row.task.title,
      skill_key: row.task.skill_key,
    });
    out.push({ ...row, resources });
  }
  return out;
}

