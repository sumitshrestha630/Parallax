export type GitHubResource = {
  title: string;
  url: string;
  description: string;
  stars: number;
  provider: "GitHub";
};

export async function fetchGitHubProjects(query: string, max = 2): Promise<GitHubResource[]> {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(Math.max(1, Math.min(5, max))));

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RootedApp",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers, next: { revalidate: 60 * 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as any;
  const items = Array.isArray(data?.items) ? data.items : [];

  return items
    .map((it: any) => {
      const name = String(it?.full_name ?? it?.name ?? "");
      const html = String(it?.html_url ?? "");
      if (!name || !html) return null;
      return {
        title: name,
        url: html,
        description: String(it?.description ?? ""),
        stars: Number(it?.stargazers_count ?? 0),
        provider: "GitHub" as const,
      };
    })
    .filter(Boolean)
    .slice(0, max);
}

