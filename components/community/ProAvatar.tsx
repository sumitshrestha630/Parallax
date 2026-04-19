"use client";

import type { Professional } from "@/types/community";

const COLORS = [
  { bg: "#6ED640", fg: "#080e1a" },
  { bg: "#1e3858", fg: "#6ED640" },
  { bg: "#FBBF24", fg: "#080e1a" },
  { bg: "#F472B6", fg: "#080e1a" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

export function ProAvatar({
  pro,
  size = 56,
}: {
  pro: Pick<Professional, "full_name" | "avatar_seed">;
  size?: number;
}) {
  const seed = pro.avatar_seed || pro.full_name;
  const { bg, fg } = COLORS[Math.abs(hash(seed)) % COLORS.length];
  const initials = pro.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        border: "2px solid #1e3858",
        boxShadow: "2px 2px 0 #1e3858",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: size / 4,
      }}
    >
      {initials}
    </div>
  );
}
