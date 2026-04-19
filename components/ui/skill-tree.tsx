"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import {
  TIER_Y,
  type SkillNode, type CareerTrack, type NodeState,
  computeXP, computeReadiness, getTrack,
  parseSkillTreePersisted,
  nodesFromProgress,
  cloneTrackNodes,
} from "@/lib/skill-tree-data";
import type { UserDashboardState } from "@/types/dashboard";
import { resolveCareerRawPath } from "@/lib/dashboard/career-dashboard";
import { inferSkillKeyForTreeNode } from "@/lib/dashboard/skill-tree-node-tasks";
import { computeLevel } from "@/lib/dashboard/dashboard-service";
import { createClient } from "@/lib/supabase/client";
import { saveSkillTreeProgress } from "@/lib/supabase/queries";

const PF = "'Press Start 2P', monospace";

/** Same 200 XP / level band as nav, CPU map, and sidebar (`user_skills` sum). */
const ACCOUNT_XP_PER_LEVEL = 200;

const DIFF_COLOR: Record<string, string> = {
  BEGINNER:     "#6ED640",
  INTERMEDIATE: "#FBBF24",
  ADVANCED:     "#F472B6",
};

const RES_ICON: Record<string, string> = {
  video: "📹", article: "📄", course: "🎓", practice: "💪",
};

// ── Individual skill node card ─────────────────────────────────────────────────
function NodeCard({
  node, track, isJustCompleted, onClick,
}: {
  node: SkillNode;
  track: CareerTrack;
  isJustCompleted: boolean;
  onClick: () => void;
}) {
  const completed = node.state === "completed";
  const active    = node.state === "active";
  const locked    = node.state === "locked";
  const isRoot    = node.tier === 0;
  const w = isRoot ? 92 : 80;

  return (
    <div
      onClick={locked ? undefined : onClick}
      style={{
        position: "absolute",
        left: `${node.x}%`,
        top:  `${TIER_Y[node.tier]}%`,
        transform: "translate(-50%, -50%)",
        width: `${w}px`,
        cursor: locked ? "default" : "pointer",
        zIndex: 10,
      }}>
      <motion.div
        whileHover={locked ? {} : { scale: 1.06 }}
        animate={isJustCompleted ? { scale: [1, 1.22, 0.96, 1] } : {}}
        transition={{ duration: 0.45 }}
        style={{
          background: completed ? `${track.color}18`
            : active ? "#0c1426" : "#090d18",
          border: `2px solid ${completed ? track.color
            : active ? `${track.color}88` : "#1a2340"}`,
          boxShadow: completed
            ? `0 0 14px ${track.color}55, 0 0 5px ${track.color}99`
            : active ? `0 0 10px ${track.color}44` : "none",
          padding: "8px 6px 8px",
          textAlign: "center",
          position: "relative",
        }}>

        {/* State badge — top-right corner */}
        <div style={{
          position: "absolute", top: -9, right: -9,
          width: 18, height: 18,
          background: completed ? track.color : active ? "#0c1426" : "#070a14",
          border: `2px solid ${completed ? track.color
            : active ? `${track.color}88` : "#1a2340"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "9px", fontWeight: "bold", color: completed ? "#060c18" : active ? track.color : "#334466",
        }}>
          {completed ? "✓" : active ? "▶" : "🔒"}
        </div>

        {/* Skill icon */}
        <div style={{
          fontSize: isRoot ? "22px" : "18px",
          lineHeight: 1, marginBottom: 4,
          opacity: locked ? 0.3 : 1,
        }}>
          {node.icon}
        </div>

        {/* Label */}
        <div style={{
          fontFamily: completed || active ? PF : "inherit",
          fontSize: completed || active ? "5.5px" : "10px",
          color: completed ? track.color : active ? "#c8d8f0" : "#2a3a50",
          lineHeight: 1.5,
        }}>
          {node.label}
        </div>

        {/* XP reward */}
        <div style={{
          fontFamily: PF, fontSize: "5px", marginTop: 4,
          color: completed ? track.color : active ? `${track.color}88` : "#1a2a40",
        }}>
          +{node.xp} XP
        </div>

        {/* Difficulty colour strip at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "3px",
          background: completed || active ? DIFF_COLOR[node.difficulty] : "#151e30",
          opacity: locked ? 0.2 : 0.85,
        }} />
      </motion.div>
    </div>
  );
}

// ── Node detail modal ──────────────────────────────────────────────────────────
function NodeModal({
  node, track, onClose, onComplete, onContinueToTasks,
}: {
  node: SkillNode;
  track: CareerTrack;
  onClose: () => void;
  onComplete: (id: string) => void;
  onContinueToTasks?: (payload: { skillKey: string; nodeId: string; nodeLabel: string }) => void;
}) {
  const canComplete = node.state === "active";
  const isCompleted = node.state === "completed";
  const isLocked    = node.state === "locked";

  return (
    <motion.div
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
      onClick={e => e.target === e.currentTarget && onClose()}>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "#080e1a",
          border: `2px solid ${track.color}55`,
          boxShadow: `0 0 48px ${track.color}22, 0 24px 64px rgba(0,0,0,0.6)`,
          width: "100%", maxWidth: "560px",
          maxHeight: "88vh",
          overflowY: "auto",
        }}>

        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: `2px solid ${track.color}22`,
          background: `${track.color}08`,
        }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div style={{ fontSize: "30px" }}>{node.icon}</div>
              <div>
                <h3 style={{
                  fontFamily: PF, fontSize: "11px", color: "#78E04A",
                  textShadow: "1px 1px 0 #1E6010, 2px 2px 0 #0A3808",
                  marginBottom: "8px",
                }}>
                  {node.label}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{
                    fontFamily: PF, fontSize: "6px",
                    color: DIFF_COLOR[node.difficulty],
                    background: `${DIFF_COLOR[node.difficulty]}15`,
                    border: `1px solid ${DIFF_COLOR[node.difficulty]}44`,
                    padding: "3px 7px",
                  }}>{node.difficulty}</span>
                  <span style={{
                    fontFamily: PF, fontSize: "6px", color: track.color,
                    background: `${track.color}15`,
                    border: `1px solid ${track.color}44`,
                    padding: "3px 7px",
                  }}>+{node.xp} XP</span>
                  {node.isRequired && (
                    <span style={{
                      fontFamily: PF, fontSize: "6px", color: "#F472B6",
                      background: "rgba(244,114,182,0.1)",
                      border: "1px solid rgba(244,114,182,0.3)",
                      padding: "3px 7px",
                    }}>REQUIRED</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "none", border: "2px solid #1a2744",
              color: "#475569", cursor: "pointer",
              padding: "4px 10px", fontFamily: PF, fontSize: "9px",
              flexShrink: 0,
            }}>✕</button>
          </div>
          <p className="text-sm mt-3" style={{ color: "#94a3b8", lineHeight: 1.75 }}>
            {node.description}
          </p>
        </div>

        <div style={{ padding: "20px" }} className="flex flex-col gap-5">

          {/* Prerequisites */}
          {node.prereqs.length > 0 && (
            <div>
              <p style={{ fontFamily: PF, fontSize: "7px", color: "#475569", marginBottom: "8px" }}>
                ▸ PREREQUISITES
              </p>
              <div className="flex flex-wrap gap-2">
                {node.prereqs.map(pid => (
                  <span key={pid} style={{
                    fontFamily: PF, fontSize: "6px",
                    color: "#94a3b8", background: "#0d1a2e",
                    border: "1px solid #1e3858", padding: "4px 10px",
                  }}>
                    {pid.replace(/_da$|_ux$/, "").replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning resources */}
          <div>
            <p style={{ fontFamily: PF, fontSize: "7px", color: "#475569", marginBottom: "8px" }}>
              ▸ LEARNING RESOURCES
            </p>
            <div className="flex flex-col gap-2">
              {node.resources.map((r, i) => (
                <div key={i} className="flex items-center gap-3" style={{
                  background: "#0d1a2e", border: "1px solid #1e3858", padding: "10px 14px",
                }}>
                  <span style={{ fontSize: "16px" }}>{RES_ICON[r.type]}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm" style={{ color: "#c8d8f0" }}>{r.title}</span>
                    <span style={{
                      marginLeft: "8px", fontFamily: PF, fontSize: "5px",
                      color: "#334466", textTransform: "uppercase",
                    }}>{r.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini challenges */}
          <div>
            <p style={{ fontFamily: PF, fontSize: "7px", color: "#475569", marginBottom: "8px" }}>
              ▸ MINI CHALLENGES
            </p>
            <div className="flex flex-col gap-2">
              {node.challenges.map((c, i) => (
                <div key={i} className="flex items-start gap-3" style={{
                  background: "#0d1a2e", border: "1px solid #1e3858", padding: "10px 14px",
                }}>
                  <div style={{
                    width: 15, height: 15, flexShrink: 0, marginTop: 2,
                    border: `2px solid ${isCompleted ? track.color : `${track.color}44`}`,
                    background: isCompleted ? `${track.color}28` : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isCompleted && (
                      <span style={{ fontSize: "8px", color: track.color }}>✓</span>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: "#94a3b8", lineHeight: 1.7 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor tip */}
          <div style={{
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.22)",
            padding: "14px 16px",
          }}>
            <p style={{ fontFamily: PF, fontSize: "7px", color: "#FBBF24", marginBottom: "8px" }}>
              ★ MENTOR TIP
            </p>
            <p className="text-sm" style={{ color: "#94a3b8", lineHeight: 1.75 }}>
              {node.mentorTip}
            </p>
          </div>

          {/* CTAs — primary path is Tasks tab (quest-style practice) */}
          <div className="flex flex-col gap-3">
            {onContinueToTasks && (
              <motion.button
                type="button"
                onClick={() => {
                  onContinueToTasks({
                    skillKey: inferSkillKeyForTreeNode(node.id),
                    nodeId: node.id,
                    nodeLabel: node.label,
                  });
                  onClose();
                }}
                whileHover={{ scale: 1.02, filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  fontFamily: PF,
                  fontSize: "9px",
                  background: "#6ED640",
                  border: "3px solid #3A9018",
                  boxShadow: "0 5px 0 #1E6010, 0 7px 0 rgba(0,0,0,0.4)",
                  color: "#0a1a06",
                  padding: "14px 24px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Continue to Tasks →
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => canComplete && onComplete(node.id)}
              disabled={!canComplete}
              whileHover={canComplete ? { scale: 1.02, filter: "brightness(1.1)" } : {}}
              whileTap={canComplete ? { scale: 0.97 } : {}}
              style={{
                fontFamily: PF,
                fontSize: "9px",
                background: isCompleted ? `${track.color}22`
                  : canComplete ? `${track.color}33` : "#0d1628",
                border: `3px solid ${isCompleted ? track.color
                  : canComplete ? `${track.color}88` : "#1a2744"}`,
                color: isCompleted ? track.color
                  : canComplete ? track.color : "#334466",
                padding: "12px 24px",
                cursor: canComplete ? "pointer" : "default",
                width: "100%",
              }}
            >
              {isCompleted
                ? "✓  Marked complete on tree"
                : isLocked
                ? "🔒  Complete prerequisites first"
                : "Mark node complete on tree"}
            </motion.button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Initial state from Supabase `metadata.skill_tree` (or template defaults) ─

/** Single career track only — progress from other tracks in metadata is ignored. */
function initSkillTreeState(dashboardState: UserDashboardState | null, lockedTrackId: string) {
  const saved = parseSkillTreePersisted(dashboardState?.metadata);
  const trackId = getTrack(lockedTrackId).id;

  const tracksProgress: Record<string, string[]> = {};
  if (saved?.tracks) {
    for (const [k, v] of Object.entries(saved.tracks)) {
      const canon = getTrack(k).id;
      if (canon !== trackId) continue;
      const ids = [...(v.completed ?? [])];
      tracksProgress[canon] = [...new Set([...(tracksProgress[canon] ?? []), ...ids])];
    }
  }

  if (!saved) {
    const nodes = cloneTrackNodes(trackId);
    tracksProgress[trackId] = nodes.filter(n => n.state === "completed").map(n => n.id);
    return { trackId, nodes, tracksProgress };
  }

  const completed = tracksProgress[trackId] ?? [];
  const nodes     = nodesFromProgress(getTrack(trackId).nodes, completed);
  tracksProgress[trackId] = [...completed];
  return { trackId, nodes, tracksProgress };
}

// ── Main exported SkillTree component ─────────────────────────────────────────
export function SkillTree({
  user,
  dashboardState,
  accountSkillXpTotal,
  onContinueToTasks,
}: {
  user: User;
  dashboardState: UserDashboardState | null;
  /** Sum of XP from Supabase `user_skills` (tasks, CPU map, etc.) — matches nav / sidebar. */
  accountSkillXpTotal?: number;
  /** Opens Tasks tab with the learn-style task flow for this node’s skill lane. */
  onContinueToTasks?: (payload: { skillKey: string; nodeId: string; nodeLabel: string }) => void;
}) {
  const goalId = user.user_metadata?.goal as string | undefined;

  const lockedCareer = useMemo(
    () => getTrack(resolveCareerRawPath(dashboardState, goalId)),
    [dashboardState, goalId]
  );

  const initial = useMemo(
    () => initSkillTreeState(dashboardState, lockedCareer.id),
    [dashboardState, lockedCareer.id]
  );

  const trackId = lockedCareer.id;

  const [nodes, setNodes]                   = useState<SkillNode[]>(initial.nodes);
  const [tracksProgress, setTracksProgress] = useState<Record<string, string[]>>(initial.tracksProgress);
  const [selectedNode, setSelectedNode]   = useState<SkillNode | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const track    = lockedCareer;
  const nodeMap  = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);
  /** XP earned from marking nodes complete on this tree only (often 0 until you check them off). */
  const pathXp = useMemo(() => computeXP(nodes), [nodes]);
  /** Sum from Supabase `user_skills` (tasks, CPU). Treat missing prop as 0 so we can merge with pathXp. */
  const dbSkillXp = useMemo(() => {
    if (typeof accountSkillXpTotal !== "number" || !Number.isFinite(accountSkillXpTotal)) return 0;
    return Math.max(0, accountSkillXpTotal);
  }, [accountSkillXpTotal]);
  /** Same pool as nav: DB-backed XP, but never below visible tree progress (nodes don’t write `user_skills` until tasks award XP). */
  const accountXp = useMemo(() => Math.max(dbSkillXp, pathXp), [dbSkillXp, pathXp]);

  const accountLevelNum = useMemo(() => computeLevel(accountXp), [accountXp]);
  const xpIntoBand      = accountXp % ACCOUNT_XP_PER_LEVEL;
  const accountXpBarPct =
    ACCOUNT_XP_PER_LEVEL > 0
      ? Math.min(100, Math.max(0, (xpIntoBand / ACCOUNT_XP_PER_LEVEL) * 100))
      : 0;

  const readiness = useMemo(() => computeReadiness(nodes), [nodes]);

  const earnedBadges = track.badges.filter(b => nodeMap[b.unlockNodeId]?.state === "completed");
  const completedCount = nodes.filter(n => n.state === "completed").length;

  const sb = useMemo(() => createClient(), []);

  const tracksProgressRef = useRef(tracksProgress);
  tracksProgressRef.current = tracksProgress;

  /** Keep `tracksProgress` aligned with the node graph — skip updates when completed ids are unchanged (avoids persist churn). */
  useEffect(() => {
    const completed = nodes.filter(n => n.state === "completed").map(n => n.id);
    setTracksProgress(tp => {
      const prev = tp[trackId];
      const same =
        prev &&
        prev.length === completed.length &&
        prev.every((id, i) => id === completed[i]);
      if (same) return tp;
      return { ...tp, [trackId]: completed };
    });
  }, [nodes, trackId]);

  const persist = useCallback(async () => {
    const payload = {
      v: 1 as const,
      lastTrackId: trackId,
      tracks: Object.fromEntries(
        Object.entries(tracksProgressRef.current).map(([k, ids]) => [k, { completed: ids }])
      ),
    };
    await saveSkillTreeProgress(sb, user.id, payload);
  }, [sb, user.id, trackId]);

  useEffect(() => {
    const t = window.setTimeout(() => { void persist(); }, 500);
    return () => window.clearTimeout(t);
  }, [persist, tracksProgress]);

  // Keep modal in sync after state changes
  useEffect(() => {
    if (selectedNode) {
      const updated = nodes.find(n => n.id === selectedNode.id);
      if (updated) setSelectedNode(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  const completeNode = (nodeId: string) => {
    setJustCompleted(nodeId);
    setTimeout(() => setJustCompleted(null), 1200);
    setNodes(prev => {
      const next = prev.map(n =>
        n.id === nodeId ? { ...n, state: "completed" as NodeState } : n
      );
      return next.map(n => {
        if (n.state !== "locked") return n;
        const met = n.prereqs.every(pid => next.find(p => p.id === pid)?.state === "completed");
        return met ? { ...n, state: "active" as NodeState } : n;
      });
    });
  };

  const TIER_LABELS = ["FOUNDATION", "CORE", "INTERMEDIATE", "ADVANCED", "CAPSTONE"];

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ background: "#060c18" }}>

      {/* ── Career path header (single track — no switching) ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3"
        style={{ borderBottom: "2px solid #1a2744", background: "#04080e" }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontFamily: PF, fontSize: "7px", color: "#334466" }}>▸ CAREER PATH</span>
          <span style={{
            fontFamily: PF, fontSize: "6px", color: "#6ED640",
            background: "rgba(110,214,64,0.1)", border: "1px solid rgba(110,214,64,0.25)",
            padding: "1px 7px",
          }}>YOUR PATH</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span style={{ fontSize: "28px", lineHeight: 1 }}>{lockedCareer.icon}</span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span style={{
              fontFamily: PF,
              fontSize: "10px",
              color: lockedCareer.color,
              textShadow: `1px 1px 0 ${lockedCareer.colorDim}`,
            }}>
              {lockedCareer.label}
            </span>
            <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>
              Progress is saved only for this track.
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center gap-5 flex-wrap"
        style={{ borderBottom: "2px solid #1a2744", background: "#030610" }}>

        {/* Level + XP — same pool as nav (sum of user_skills.xp), not only tree checkbox XP */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div style={{
              background: track.colorDim, border: `2px solid ${track.color}`,
              fontFamily: PF, fontSize: "7px", color: track.color, padding: "3px 9px",
            }}>
              LV {accountLevelNum}
            </div>
            <span style={{ fontFamily: PF, fontSize: "6px", color: "#64748b" }}>
              Skill XP total: {accountXp} · band {xpIntoBand}/{ACCOUNT_XP_PER_LEVEL}
            </span>
          </div>
          {pathXp !== dbSkillXp && (
            <span style={{ fontFamily: PF, fontSize: "5px", color: "#475569" }}>
              Saved (profile) skills: {dbSkillXp} XP · this path’s nodes: {pathXp} XP — complete tasks to add to the shared total
            </span>
          )}
        </div>

        {/* XP bar — current level band fill matches top nav */}
        <div className="flex items-center gap-2" style={{ minWidth: "160px", maxWidth: "240px" }}>
          <span style={{ fontFamily: PF, fontSize: "6px", color: "#334466", flexShrink: 0 }}>XP</span>
          <div className="flex-1 h-2" style={{ background: "#162238", border: "1px solid #1e3858" }}>
            <motion.div className="h-full"
              animate={{ width: `${accountXpBarPct}%` }}
              transition={{ duration: 0.8 }}
              style={{ background: `linear-gradient(90deg, ${track.colorDim}, ${track.color})` }} />
          </div>
          <span style={{ fontFamily: PF, fontSize: "6px", color: track.color }}>{accountXp}</span>
        </div>

        {/* Career readiness */}
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: PF, fontSize: "6px", color: "#334466" }}>READINESS</span>
          <div style={{ width: 64, height: 6, background: "#162238", border: "1px solid #1e3858" }}>
            <motion.div
              animate={{ width: `${readiness}%` }}
              transition={{ duration: 0.8 }}
              style={{ height: "100%", background: "#6ED640" }} />
          </div>
          <span style={{ fontFamily: PF, fontSize: "6px", color: "#6ED640" }}>{readiness}%</span>
        </div>

        {/* Badges */}
        <div style={{ fontFamily: PF, fontSize: "6px", color: "#FBBF24" }}>
          ★ {earnedBadges.length}/{track.badges.length} BADGES
        </div>

        {/* Skill count */}
        <div style={{ fontFamily: PF, fontSize: "6px", color: "#334466" }}>
          {completedCount}/{nodes.length} SKILLS
        </div>
      </div>

      {/* ── Tree visualization ── */}
      <div className="flex-1 overflow-y-auto relative"
        style={{
          backgroundImage: `
            radial-gradient(${track.color}14 1px, transparent 1px),
            radial-gradient(ellipse at 50% 10%, ${track.color}0e 0%, transparent 52%),
            linear-gradient(to bottom, #030810, #060c18 40%, #030810)
          `,
          backgroundSize: "28px 28px, 100% 100%, 100% 100%",
        }}>

        <div className="relative" style={{ minHeight: "620px" }}>

          {/* SVG bezier connection lines */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none">
            {track.edges.map(([fromId, toId]) => {
              const from = nodeMap[fromId], to = nodeMap[toId];
              if (!from || !to) return null;
              const x1 = from.x, y1 = TIER_Y[from.tier];
              const x2 = to.x,   y2 = TIER_Y[to.tier];
              const midY = (y1 + y2) / 2;
              const bothDone = from.state === "completed" && to.state === "completed";
              const active   = from.state === "completed" && to.state === "active";
              return (
                <path key={`${fromId}-${toId}`}
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke={bothDone ? track.color : active ? `${track.color}66` : "#151e2e"}
                  strokeWidth={bothDone ? 0.4 : 0.25}
                  strokeOpacity={bothDone ? 0.75 : active ? 0.55 : 0.35}
                  strokeDasharray={to.state === "locked" ? "0.6 0.8" : undefined}
                />
              );
            })}
          </svg>

          {/* Tier labels (left side, rotated) */}
          {TIER_LABELS.map((label, tier) => (
            <div key={tier} style={{
              position: "absolute",
              top: `${TIER_Y[tier]}%`,
              left: "3px",
              transform: "translateY(-50%)",
              fontFamily: PF, fontSize: "4.5px",
              color: "#1a2438",
              userSelect: "none",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}>
              {label}
            </div>
          ))}

          {/* Skill nodes */}
          {nodes.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              track={track}
              isJustCompleted={justCompleted === node.id}
              onClick={() => setSelectedNode(node)}
            />
          ))}
        </div>
      </div>

      {/* ── Badges + hiring manager strip ── */}
      <div className="flex-shrink-0 px-4 py-3 gap-4 flex items-start flex-wrap"
        style={{ borderTop: "2px solid #1a2744", background: "#030610" }}>

        {/* Badges */}
        <div className="flex-1" style={{ minWidth: "260px" }}>
          <p style={{ fontFamily: PF, fontSize: "6px", color: "#FBBF24", marginBottom: "8px" }}>
            ★ BADGES
          </p>
          <div className="flex gap-2 flex-wrap">
            {track.badges.map(badge => {
              const earned = nodeMap[badge.unlockNodeId]?.state === "completed";
              return (
                <div key={badge.id} title={badge.label} style={{
                  background: earned ? "rgba(251,191,36,0.1)" : "#0a1020",
                  border: `2px solid ${earned ? "#FBBF24" : "#1a2340"}`,
                  padding: "6px 10px",
                  display: "flex", alignItems: "center", gap: "6px",
                  opacity: earned ? 1 : 0.38,
                  filter: earned ? "none" : "grayscale(1)",
                  transition: "all 0.4s",
                }}>
                  <span style={{ fontSize: "14px" }}>{badge.emoji}</span>
                  <span style={{
                    fontFamily: PF, fontSize: "5.5px",
                    color: earned ? "#FBBF24" : "#2a3a50",
                  }}>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hiring manager + mentor notes */}
        <div className="flex gap-3 flex-wrap" style={{ flexShrink: 0 }}>
          <div style={{ width: "210px", background: "#0d1628", border: "1px solid #1a2744", padding: "10px 12px" }}>
            <p style={{ fontFamily: PF, fontSize: "6px", color: "#F472B6", marginBottom: "6px" }}>
              💼 HIRING MANAGER
            </p>
            <p style={{ fontSize: "10px", color: "#475569", lineHeight: 1.65 }}>
              {track.hiringManagerNote}
            </p>
          </div>
          <div style={{ width: "210px", background: "#0d1628", border: "1px solid #1a2744", padding: "10px 12px" }}>
            <p style={{ fontFamily: PF, fontSize: "6px", color: "#6ED640", marginBottom: "6px" }}>
              🎓 MENTOR SAYS
            </p>
            <p style={{ fontSize: "10px", color: "#475569", lineHeight: 1.65 }}>
              {track.mentorRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* ── Node detail modal ── */}
      <AnimatePresence>
        {selectedNode && (
          <NodeModal
            node={selectedNode}
            track={track}
            onClose={() => setSelectedNode(null)}
            onComplete={completeNode}
            onContinueToTasks={onContinueToTasks}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
