import type { Professional } from "@/lib/types";

const palette = [
  ["bg-primary", "text-primary-foreground"],
  ["bg-secondary", "text-secondary-foreground"],
  ["bg-accent", "text-accent-foreground"],
  ["bg-success", "text-success-foreground"],
];

export const PixelAvatar = ({ pro, size = 56 }: { pro: Pick<Professional, "full_name" | "avatar_seed">; size?: number }) => {
  const seed = pro.avatar_seed || pro.full_name;
  const idx = Math.abs(hash(seed)) % palette.length;
  const [bg, fg] = palette[idx];
  const initials = pro.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`grid shrink-0 place-items-center border-2 border-border shadow-pixel-sm ${bg} ${fg}`}
      style={{ width: size, height: size }}
    >
      <span className="font-pixel" style={{ fontSize: size / 4 }}>
        {initials}
      </span>
    </div>
  );
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
