/**
 * Canonical CPU career-map layout — pins, tracks, and chip positions in viewBox `0 0 300 150`.
 * Must stay aligned with `BOX_PINS` / SVG in `cpu-architecture.tsx`.
 */

export interface CpuSkillLayoutDefault {
  id: string;
  label: string;
  ex: number;
  ey: number;
  path: string;
  color: string;
  dashDuration: string;
}

/** Fixed order — matches the original static map and connection routing. */
export const CPU_SKILL_DEFAULTS: CpuSkillLayoutDefault[] = [
  {
    id: "frontend",
    label: "Frontend",
    ex: 45,
    ey: 40,
    path: "M 120 65 L 70 65 L 70 40 L 45 40",
    color: "#60A5FA",
    dashDuration: "2.0s",
  },
  {
    id: "aiml",
    label: "AI / ML",
    ex: 45,
    ey: 110,
    path: "M 120 85 L 65 85 L 65 110 L 45 110",
    color: "#A78BFA",
    dashDuration: "2.4s",
  },
  {
    id: "backend",
    label: "Backend",
    ex: 255,
    ey: 40,
    path: "M 180 65 L 230 65 L 230 40 L 255 40",
    color: "#6ED640",
    dashDuration: "1.8s",
  },
  {
    id: "devops",
    label: "DevOps",
    ex: 255,
    ey: 110,
    path: "M 180 85 L 235 85 L 235 110 L 255 110",
    color: "#FBBF24",
    dashDuration: "2.6s",
  },
  {
    id: "cloud",
    label: "Cloud",
    ex: 88,
    ey: 20,
    path: "M 140 57 L 140 35 L 88 35 L 88 20",
    color: "#22D3EE",
    dashDuration: "2.2s",
  },
  {
    id: "networking",
    label: "Networking",
    ex: 212,
    ey: 20,
    path: "M 160 57 L 160 25 L 212 25 L 212 20",
    color: "#34D399",
    dashDuration: "1.6s",
  },
  {
    id: "databases",
    label: "Databases",
    ex: 88,
    ey: 130,
    path: "M 140 93 L 140 115 L 88 115 L 88 130",
    color: "#F472B6",
    dashDuration: "2.8s",
  },
  {
    id: "projects",
    label: "Projects",
    ex: 212,
    ey: 130,
    path: "M 160 93 L 160 125 L 212 125 L 212 130",
    color: "#FB923C",
    dashDuration: "2.0s",
  },
];
