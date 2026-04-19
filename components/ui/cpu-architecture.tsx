"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { UserSkill } from "@/types/dashboard";
import { CPU_SKILL_DEFAULTS } from "@/lib/dashboard/cpu-map-defaults";
import { finiteOr, skillsToNodes } from "@/lib/dashboard/dashboard-service";

const PF = "'Press Start 2P', monospace";

/** Copy for skill popup — keyed by `skill_key` / static node `id`. */
const CPU_NODE_DETAILS: Record<string, string> = {
  frontend:
    "Browsers, HTML, CSS, JavaScript, and modern frameworks. This is where users experience your product — strong frontend skills make every feature feel polished.",
  aiml:
    "Machine learning fundamentals, data for models, and practical AI tooling. Build intuition for when ML helps and how to ship responsible features.",
  backend:
    "Servers, APIs, databases, and business logic behind the scenes. Reliability, security, and clear contracts with the frontend define great backend work.",
  devops:
    "CI/CD, containers, observability, and infrastructure as code. Ship often, recover quickly, and keep production boring in the best way.",
  cloud:
    "Managed services, scaling patterns, and cloud-native architecture. Learn one provider deeply, then transfer concepts across AWS, GCP, or Azure.",
  networking:
    "How data moves: TCP/IP, DNS, TLS, load balancers, and CDNs. Essential for debugging distributed systems and designing resilient apps.",
  databases:
    "Relational and NoSQL stores, modeling, queries, and performance. Almost every system eventually bottlenecks on data — get comfortable here early.",
  projects:
    "End-to-end ownership: scoping, shipping, and iterating on real work. Your portfolio and internships reward proof, not just tutorials.",
};

// SVG coordinate space: viewBox "0 0 300 150"
const VB_W = 300, VB_H = 150;

/** CPU die (chip) rect — career / level / XP bar share this interior */
const CHIP = {
  x:      120,
  y:      57,
  w:      60,
  h:      36,
  accent: 1.8,
  cx:     150,
  padX:   4,
  barW:   52,
  barH:   2.4,
  fsLvl:  3.2,
  fsXp:   2.85,
} as const;

interface SkillNode {
  id:           string;
  label:        string;
  ex:           number; // endpoint x in viewBox coords
  ey:           number; // endpoint y in viewBox coords
  path:         string; // orthogonal path from box pin to endpoint
  color:        string;
  state:        "active" | "locked";
  xp?:          number;
  dashDuration: string;
}

/** Fallback map when no Supabase rows — keeps the same geometry as {@link CPU_SKILL_DEFAULTS}. */
const SKILL_NODES: SkillNode[] = CPU_SKILL_DEFAULTS.map(def => ({
  id:           def.id,
  label:        def.label,
  ex:           def.ex,
  ey:           def.ey,
  path:         def.path,
  color:        def.color,
  dashDuration: def.dashDuration,
  state:        def.id === "frontend" ? "active" : "locked",
  ...(def.id === "frontend" ? { xp: 0 as number } : {}),
}));

/** Highlights one skill node (career focus); pulls XP for that skill from Supabase when present. */
function applyCareerFocusUnlock<T extends { id: string; state: "active" | "locked"; xp?: number }>(
  nodes: T[],
  focusSkillId: string,
  userSkills?: UserSkill[]
): T[] {
  return nodes.map(n => {
    if (n.id === focusSkillId) {
      const row = userSkills?.find(s => s.skill_key === focusSkillId);
      const raw = row?.xp ?? n.xp ?? 0;
      const xpVal = typeof raw === "number" ? raw : Number(raw);
      return {
        ...n,
        state: "active" as const,
        xp:    Number.isFinite(xpVal) ? xpVal : 0,
      } as T;
    }
    return { ...n, state: "locked" as const, xp: undefined } as T;
  });
}

const BOX_PINS = [
  { cx: 120, cy: 65, nodeId: "frontend"   },
  { cx: 120, cy: 85, nodeId: "aiml"       },
  { cx: 180, cy: 65, nodeId: "backend"    },
  { cx: 180, cy: 85, nodeId: "devops"     },
  { cx: 140, cy: 57, nodeId: "cloud"      },
  { cx: 160, cy: 57, nodeId: "networking" },
  { cx: 140, cy: 93, nodeId: "databases"  },
  { cx: 160, cy: 93, nodeId: "projects"   },
];

const CORNER_MARKS = [
  "M 124 57 L 120 57 L 120 61",  // top-left
  "M 176 57 L 180 57 L 180 61",  // top-right
  "M 124 93 L 120 93 L 120 89",  // bottom-left
  "M 176 93 L 180 93 L 180 89",  // bottom-right
];

function resolveNodeDescription(id: string, userSkills?: UserSkill[]): string {
  const row = userSkills?.find(s => s.skill_key === id);
  const meta  = row?.metadata as { description?: string } | undefined;
  if (meta?.description?.trim()) return meta.description.trim();
  return CPU_NODE_DETAILS[id] ?? "This area connects to your career map. Grow XP here to reflect your focus and unlock related paths.";
}

interface SvgBounds { left: number; top: number; width: number; height: number }

function CpuNodeDetailModal({
  label,
  description,
  color,
  active,
  xp,
  onClose,
}: {
  label:       string;
  description: string;
  color:       string;
  active:      boolean;
  xp?:         number;
  onClose:     () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cpu-node-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(2,5,14,0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "#080e1a",
          border: `2px solid ${color}55`,
          boxShadow: `0 0 48px ${color}22, 0 24px 64px rgba(0,0,0,0.6)`,
          width: "100%", maxWidth: "480px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "20px",
          borderBottom: `2px solid ${color}22`,
          background: `${color}08`,
        }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="cpu-node-title"
                style={{
                  fontFamily: PF, fontSize: "11px", color: "#78E04A",
                  textShadow: "1px 1px 0 #1E6010, 2px 2px 0 #0A3808",
                  marginBottom: "10px", lineHeight: 1.4,
                }}
              >
                {label}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{
                  fontFamily: PF, fontSize: "6px",
                  color: active ? color : "#64748b",
                  background: active ? `${color}18` : "#0d1628",
                  border: `1px solid ${active ? `${color}44` : "#1a2744"}`,
                  padding: "3px 8px",
                }}>
                  {active ? "● ACTIVE" : "○ LOCKED"}
                </span>
                {active && xp !== undefined && (
                  <span style={{
                    fontFamily: PF, fontSize: "6px", color: "#6ED640",
                    background: "rgba(110,214,64,0.1)",
                    border: "1px solid rgba(110,214,64,0.25)",
                    padding: "3px 8px",
                  }}>
                    {xp} XP
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none", border: "2px solid #1a2744",
                color: "#475569", cursor: "pointer",
                padding: "4px 10px", fontFamily: PF, fontSize: "9px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div style={{ padding: "20px" }}>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.75, margin: 0 }}>
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Career lines + font size chosen to fit the chip interior above level + bar + XP row.
 */
function chipCareerLines(raw: string): { lines: [string] | [string, string]; fontSize: number } {
  const t = raw.trim().toUpperCase();
  if (!t) return { lines: ["TRACK"], fontSize: 5.5 };
  const words = t.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    const a = words.slice(0, mid).join(" ");
    const b = words.slice(mid).join(" ");
    const fs = Math.max(3.8, Math.min(5.8, 7.4 - (a.length + b.length) * 0.07));
    return { lines: [a, b], fontSize: fs };
  }

  const one = words[0] ?? t;
  if (one.length <= 10) return { lines: [one], fontSize: 6.2 };
  const mid = Math.ceil(one.length / 2);
  const fs = Math.max(3.8, Math.min(5.4, 6.5 - one.length * 0.05));
  return { lines: [one.slice(0, mid), one.slice(mid)], fontSize: fs };
}

/**
 * Chip interior layout using row **center** Y + `dominantBaseline="middle"` so text
 * aligns with the bar and sits squarely in the die (no baseline drift).
 * Stack from bottom: XP → bar → level → career (top).
 */
function chipInnerLayout(doubleCareer: boolean, careerFs: number): {
  cx: number;
  barLeft: number;
  barTop: number;
  xpMidY: number;
  barMidY: number;
  levelMidY: number;
  career1MidY: number;
  career2MidY: number | null;
} {
  const pad = { t: 0.55, b: 1.15, x: 3 };
  const innerTop = CHIP.y + CHIP.accent + pad.t;
  const innerBottom = CHIP.y + CHIP.h - pad.b;
  const cx = CHIP.cx;
  const barLeft = cx - CHIP.barW / 2;

  const gapAfterXp = 1.05;
  const gapAfterBar = 1.05;
  const gapAfterLevel = 1.45;

  /** Visual row heights (approximate em-box for middle anchoring). */
  const hXp = CHIP.fsXp * 1.35;
  const hLvl = CHIP.fsLvl * 1.35;
  const hCareer = careerFs * 1.2;
  const betweenCareerLines = 5.4;

  /** Walk upward from bottom center of XP row. */
  let y = innerBottom - hXp / 2;
  const xpMidY = y;

  y -= hXp / 2 + gapAfterXp + CHIP.barH / 2;
  const barMidY = y;
  const barTop = barMidY - CHIP.barH / 2;

  y -= CHIP.barH / 2 + gapAfterBar + hLvl / 2;
  const levelMidY = y;

  y -= hLvl / 2 + gapAfterLevel;
  const careerBandBottom = y;

  let career1MidY: number;
  let career2MidY: number | null = null;

  if (doubleCareer) {
    career2MidY = careerBandBottom - hCareer / 2;
    career1MidY = career2MidY - betweenCareerLines - hCareer / 2;
    const topNeeded = career1MidY - hCareer / 2;
    if (topNeeded < innerTop) {
      const shift = innerTop - topNeeded + 0.35;
      career1MidY += shift;
      career2MidY += shift;
    }
  } else {
    career1MidY = (innerTop + careerBandBottom) / 2;
  }

  return {
    cx,
    barLeft,
    barTop,
    xpMidY,
    barMidY,
    levelMidY,
    career1MidY,
    career2MidY,
  };
}

interface CpuArchitectureProps {
  username?:     string;
  /** Primary label on the chip (career track). Falls back to shortened username. */
  careerTitle?: string;
  /** Which `skill_key` on the map is the active career focus (matches user_skills rows). Default `frontend`. */
  focusSkillKey?: string;
  level?:        number;
  /** XP toward the current level band (same scale as maxXp, typically 0–199 vs 200). */
  xp?:           number;
  maxXp?:        number;
  /** Sum of all skill XP — shown under the bar when set. */
  totalSkillXp?: number;
  /** When provided, overrides the static SKILL_NODES with live Supabase data. */
  userSkills?: UserSkill[];
  className?:    string;
}

export function CpuArchitecture({
  username      = "YOU",
  careerTitle,
  focusSkillKey = "frontend",
  level        = 1,
  xp           = 0,
  maxXp        = 200,
  totalSkillXp,
  userSkills,
  className,
}: CpuArchitectureProps) {
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [detailId, setDetailId]     = useState<string | null>(null);
  const [svgBounds, setSvgBounds]   = useState<SvgBounds | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openDetail  = useCallback((id: string) => setDetailId(id), []);
  const closeDetail = useCallback(() => setDetailId(null), []);

  // Live layout from Supabase when present; one node stays "active" as the user's career focus.
  const activeNodes = useMemo(() => {
    const raw =
      userSkills && userSkills.length > 0 ? skillsToNodes(userSkills) : SKILL_NODES;
    return applyCareerFocusUnlock(raw, focusSkillKey, userSkills);
  }, [userSkills, focusSkillKey]);

  const detailNode = useMemo(
    () => (detailId ? activeNodes.find(n => n.id === detailId) ?? null : null),
    [detailId, activeNodes]
  );

  useEffect(() => {
    if (!detailId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailId, closeDetail]);

  // Track the SVG's actual rendered content area (accounting for meet + letterbox)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      const scaleX = width  / VB_W;
      const scaleY = height / VB_H;
      const scale  = Math.min(scaleX, scaleY); // "meet" picks smaller scale
      const w = VB_W * scale;
      const h = VB_H * scale;
      setSvgBounds({ left: (width - w) / 2, top: (height - h) / 2, width: w, height: h });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Convert a viewBox coordinate to a CSS pixel offset from container top-left
  const toCSS = (vx: number, vy: number) => {
    if (!svgBounds) return { left: "50%", top: "50%" };
    return {
      left: `${svgBounds.left + (vx / VB_W) * svgBounds.width}px`,
      top:  `${svgBounds.top  + (vy / VB_H) * svgBounds.height}px`,
    };
  };

  /** Career track only on the die (username is last resort). */
  const chipSource = careerTitle?.trim() || username.slice(0, 12).trim() || "TRACK";
  const { lines: careerLines, fontSize: chipCareerFs } = chipCareerLines(chipSource);
  const xpPct = maxXp > 0 ? Math.min((finiteOr(xp, 0) / maxXp) * 100, 100) : 0;
  const chipClipId = useId().replace(/:/g, "");
  const layout = useMemo(
    () => chipInnerLayout(careerLines.length === 2, chipCareerFs),
    [careerLines.length, chipCareerFs]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full bg-[#020617]", className)}
    >
      <AnimatePresence>
        {detailNode && (
          <CpuNodeDetailModal
            key={detailNode.id}
            label={detailNode.label}
            description={resolveNodeDescription(detailNode.id, userSkills)}
            color={detailNode.color}
            active={detailNode.state === "active"}
            xp={detailNode.xp}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>
      {/* ── SVG: grid + lines + chip ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="cpudots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="0.35" fill="rgba(100,150,200,0.12)" />
          </pattern>
          <radialGradient id="centerglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#6ED640" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#6ED640" stopOpacity="0"    />
          </radialGradient>
          <clipPath id={chipClipId}>
            <rect
              x={CHIP.x + 1.25}
              y={CHIP.y + CHIP.accent + 0.35}
              width={CHIP.w - 2.5}
              height={CHIP.h - CHIP.accent - 1.35}
            />
          </clipPath>
          <style>{`
            @keyframes cpudash { to { stroke-dashoffset: -20; } }
          `}</style>
        </defs>

        <rect width={VB_W} height={VB_H} fill="url(#cpudots)" />
        <ellipse cx="150" cy="75" rx="60" ry="42" fill="url(#centerglow)" />

        {/* Connection tracks — whole branch is clickable (see transparent hit circle) */}
        {activeNodes.map(node => {
          const hov    = hoveredId === node.id;
          const active = node.state === "active";
          const nx     = finiteOr(node.ex, 150);
          const ny     = finiteOr(node.ey, 75);
          return (
            <g
              key={node.id}
              role="presentation"
              style={{ cursor: "pointer" }}
              onClick={() => openDetail(node.id)}
            >
              <path
                d={node.path}
                fill="none"
                stroke={node.color}
                strokeWidth={0.5}
                strokeOpacity={active ? 0.22 : 0.08}
                pointerEvents="stroke"
              />
              {active && (
                <path
                  d={node.path}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={0.7}
                  strokeOpacity={hov ? 1 : 0.5}
                  strokeDasharray="3 7"
                  style={{ animation: `cpudash ${node.dashDuration} linear infinite` }}
                  pointerEvents="stroke"
                />
              )}
              <circle
                cx={nx} cy={ny}
                r={hov ? 2.6 : 1.7}
                fill={node.color}
                fillOpacity={active ? (hov ? 1 : 0.75) : 0.22}
                style={{ pointerEvents: "none" }}
              />
              {hov && (
                <circle
                  cx={nx} cy={ny}
                  r={5.5}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={0.4}
                  strokeOpacity={0.4}
                  style={{ pointerEvents: "none" }}
                />
              )}
              {/* Large invisible target so clicks are easy to land */}
              <circle
                cx={nx}
                cy={ny}
                r={12}
                fill="transparent"
                style={{ pointerEvents: "all" }}
              />
            </g>
          );
        })}

        {/* Box pin dots */}
        {BOX_PINS.map((pin, i) => {
          const node  = activeNodes.find(n => n.id === pin.nodeId);
          return (
            <circle
              key={i}
              cx={pin.cx} cy={pin.cy}
              r={1.1}
              fill={node?.color ?? "#334155"}
              fillOpacity={node?.state === "active" ? 0.85 : 0.18}
            />
          );
        })}

        {/* Chip body — bezel + accent strip */}
        <rect x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} fill="#04090f" stroke="#1a2744" strokeWidth={0.7} />
        <rect x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.accent} fill="#3A9018" opacity={0.55} />

        {/* Corner L-marks */}
        {CORNER_MARKS.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#6ED640" strokeWidth={0.65} opacity={0.65} />
        ))}

        {/* Inner content: same centerline (cx); rows use middle baseline for optical alignment */}
        <g clipPath={`url(#${chipClipId})`}>
          <text
            x={layout.cx}
            y={layout.career1MidY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#78E04A"
            fontSize={chipCareerFs}
            fontFamily={PF}
            letterSpacing={careerLines.length === 2 ? 0.35 : 0.45}
          >
            {careerLines[0]}
          </text>
          {careerLines.length === 2 && layout.career2MidY !== null ? (
            <text
              x={layout.cx}
              y={layout.career2MidY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#78E04A"
              fontSize={chipCareerFs}
              fontFamily={PF}
              letterSpacing={0.35}
            >
              {careerLines[1]}
            </text>
          ) : null}

          <text
            x={layout.cx}
            y={layout.levelMidY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748b"
            fontSize={CHIP.fsLvl}
            fontFamily={PF}
            letterSpacing={0.5}
          >
            LV {level}
          </text>

          <rect
            x={layout.barLeft}
            y={layout.barTop}
            width={CHIP.barW}
            height={CHIP.barH}
            fill="#0d1a2e"
            rx={0.8}
          />
          <rect
            x={layout.barLeft}
            y={layout.barTop}
            width={CHIP.barW * (xpPct / 100)}
            height={CHIP.barH}
            fill="#6ED640"
            rx={0.8}
            opacity={0.9}
          />

          <text
            x={layout.cx}
            y={layout.xpMidY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#334155"
            fontSize={CHIP.fsXp}
            fontFamily={PF}
            letterSpacing={0.35}
          >
            {totalSkillXp !== undefined
              ? `${finiteOr(totalSkillXp, 0)} XP`
              : `${finiteOr(xp, 0)} / ${finiteOr(maxXp, 200)}`}
          </text>
        </g>
      </svg>

      {/* ── HTML skill pills (pixel-accurate positioning) ── */}
      {svgBounds && activeNodes.map(node => {
        const hov    = hoveredId === node.id;
        const active = node.state === "active";
        const nx     = finiteOr(node.ex, 150);
        const ny     = finiteOr(node.ey, 75);
        return (
          <div
            key={node.id}
            role="button"
            tabIndex={0}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none"
            style={{
              ...toCSS(nx, ny),
              transform:  `translate(-50%, -50%) scale(${hov ? 1.12 : 1})`,
              transition: "transform 0.18s ease",
            }}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => openDetail(node.id)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail(node.id);
              }
            }}
          >
            <div
              style={{
                fontFamily:     PF,
                fontSize:       "7px",
                padding:        "4px 10px",
                background:     active ? "rgba(4,9,18,0.92)" : "rgba(4,9,18,0.60)",
                border:         `1.5px solid ${active ? node.color + "65" : "#0f1e36"}`,
                color:          active ? node.color : "#2d3f56",
                whiteSpace:     "nowrap",
                backdropFilter: "blur(4px)",
                boxShadow:      hov && active ? `0 0 14px ${node.color}50, 0 0 5px ${node.color}80` : "none",
                transition:     "box-shadow 0.18s ease",
              }}
            >
              {node.label}
              {active && node.xp !== undefined && (
                <span style={{ color: "#334155", marginLeft: "5px", fontSize: "6px" }}>
                  +{node.xp}xp
                </span>
              )}
              {!active && (
                <span style={{ marginLeft: "4px", opacity: 0.45, fontSize: "8px" }}>🔒</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
