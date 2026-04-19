export type YouTubeResource = {
  title: string;
  url: string;
  thumbnail: string;
  provider: "YouTube";
  videoId: string;
};

export async function fetchYouTubeResources(query: string, max = 2): Promise<YouTubeResource[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(Math.max(1, Math.min(5, max))));
  url.searchParams.set("key", key);
  url.searchParams.set("safeSearch", "moderate");

  const res = await fetch(url.toString(), { next: { revalidate: 60 * 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as any;

  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .map((it: any) => {
      const videoId = String(it?.id?.videoId ?? "");
      const title = String(it?.snippet?.title ?? "");
      const thumb =
        String(it?.snippet?.thumbnails?.medium?.url ?? it?.snippet?.thumbnails?.default?.url ?? "");
      if (!videoId || !title) return null;
      return {
        title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: thumb,
        provider: "YouTube" as const,
        videoId,
      };
    })
    .filter(Boolean)
    .slice(0, max);
}

