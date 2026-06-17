"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { PixelAvatar } from "@/components/ui/pixel-avatar";
import { SkillTree } from "@/components/ui/skill-tree";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { BalanceView } from "@/components/balance/BalanceView";
import { TaskPage, type SkillTreeTaskFocus } from "@/components/dashboard/TaskPage";
import { ResumeAnalyzer } from "@/components/resume/ResumeAnalyzer";
import { CommunityHub } from "@/components/community/CommunityHub";
import type { DashboardData, UserSkill } from "@/types/dashboard";
import { DashboardSkillsSyncProvider } from "@/components/dashboard/dashboard-skills-sync";
import { fetchUserSkillsClient } from "@/lib/dashboard/fetch-user-skills-client";
import { computeTotalXp, computeLevel } from "@/lib/dashboard/dashboard-service";
import {
  balanceTipForTrack,
  recommendedForTrack,
  resolveDashboardCareer,
  sidebarTasksForTrack,
} from "@/lib/dashboard/career-dashboard";
import {
  parseSkillTreePersisted,
  nodesFromProgress,
  computeReadiness,
} from "@/lib/skill-tree-data";

const XP_PER_LEVEL = 200;

// ── Shared design tokens (mirrors landing page) ───────────────────────────────
const PF = "'Press Start 2P', monospace";

const PIXEL_BTN_STYLE = (
  bg = "#6ED640",
  border = "#3A9018",
  shadow = "#1E6010"
): React.CSSProperties => ({
  fontFamily: PF,
  fontSize: "13px",
  background: bg,
  border: `3px solid ${border}`,
  boxShadow: `0 4px 0 ${shadow}, 0 6px 0 rgba(0,0,0,0.4)`,
  padding: "10px 18px",
  color: bg === "#6ED640" ? "#0a1a06" : "#6ED640",
  cursor: "pointer",
});

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: PF,
  color: "#78E04A",
  textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808",
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: PF,
  fontSize: "12px",
  color: "#6ED640",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

const DIFF_COLOR: Record<string, string> = {
  BEGINNER:     "#6ED640",
  INTERMEDIATE: "#FBBF24",
  ADVANCED:     "#F472B6",
};


const NAV_TABS = ["Dashboard", "Skill Tree", "Tasks", "Balance", "Resume", "Community"] as const;
type NavTab = typeof NAV_TABS[number];
const TASK_TABS = ["Upcoming", "Tasks", "Completed"] as const;
type TaskTab = typeof TASK_TABS[number];

// ── Dashboard ─────────────────────────────────────────────────────────────────
interface DashboardProps {
  user:           User;
  dashboardData?: DashboardData;
}

export function Dashboard({ user, dashboardData }: DashboardProps) {
  const router = useRouter();
  const prevNavTab = useRef<NavTab | null>(null);
  const [navTab, setNavTab]   = useState<NavTab>("Dashboard");
  const [taskTab, setTaskTab] = useState<TaskTab>("Tasks");
  const [tasksFromSkillTree, setTasksFromSkillTree] = useState<SkillTreeTaskFocus | null>(null);
  const [overdueCount, setOverdueCount] = useState(0);

  const clearTasksFromSkillTree = useCallback(() => {
    setTasksFromSkillTree(null);
  }, []);

  const name       = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Explorer";
  const avatar     = user.user_metadata?.avatar_url as string | undefined;
  const avatarType = (dashboardData?.state?.active_avatar ?? user.user_metadata?.avatar_type) as string | undefined;
  const goalLabel  = user.user_metadata?.goal_label as string | undefined;

  /** Live copy of `user_skills` — updated from server props and immediately after XP mutations via Supabase client + refresh. */
  const [skillRows, setSkillRows] = useState<UserSkill[]>(() => dashboardData?.skills ?? []);

  const serverSkillsSignature = useMemo(
    () =>
      JSON.stringify(
        (dashboardData?.skills ?? []).map(s => [s.skill_key, s.xp, s.level, s.unlocked])
      ),
    [dashboardData?.skills]
  );

  useEffect(() => {
    setSkillRows(dashboardData?.skills ?? []);
  }, [serverSkillsSignature, dashboardData?.skills]);

  const syncSkillsFromDb = useCallback(async () => {
    try {
      const rows = await fetchUserSkillsClient(user.id);
      setSkillRows(rows);
    } catch {
      /* ignore — optional UI hint could go here */
    }
    router.refresh();
  }, [user.id, router]);

  /** Hydrate `user_skills` from the browser Supabase client once — fixes empty/stale shell data when server fetch fails silently. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchUserSkillsClient(user.id);
        if (!cancelled) setSkillRows(rows);
      } catch {
        /* keep server-provided skillRows */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const skills = skillRows;
  const totalXp = computeTotalXp(skills);
  const level   = computeLevel(totalXp);
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const careerRes = useMemo(
    () =>
      resolveDashboardCareer(
        dashboardData?.state ?? null,
        user.user_metadata?.goal as string | undefined
      ),
    [dashboardData?.state, user.user_metadata?.goal]
  );
  const careerLabel = careerRes.track.label;
  const cpuFocusSkillKey = careerRes.cpuFocusSkillKey;

  const recommendedTasks = useMemo(
    () => recommendedForTrack(careerRes.track.id),
    [careerRes.track.id]
  );
  const sidebarTasks = useMemo(
    () => sidebarTasksForTrack(careerRes.track.id),
    [careerRes.track.id]
  );
  const balanceTipText = useMemo(
    () => balanceTipForTrack(careerRes.track.id),
    [careerRes.track.id]
  );
  /** Fill = share of current level band (200 XP steps), direct from summed user_skills.xp */
  const levelProgressPct =
    XP_PER_LEVEL > 0 ? Math.min(100, Math.max(0, (totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100) : 0;

  /** % of required skill tree nodes completed for this career track */
  const careerReadinessPct = useMemo(() => {
    const persisted = parseSkillTreePersisted(dashboardData?.state?.metadata as Record<string, unknown> | null);
    const completedIds = persisted?.tracks?.[careerRes.track.id]?.completed ?? [];
    const nodes = nodesFromProgress(careerRes.track.nodes, completedIds);
    return computeReadiness(nodes);
  }, [dashboardData?.state?.metadata, careerRes.track]);

  /** Currently focused skill tree node + challenge progress */
  const currentlyLearning = useMemo(() => {
    const persisted = parseSkillTreePersisted(dashboardData?.state?.metadata as Record<string, unknown> | null);
    const trackData  = persisted?.tracks?.[careerRes.track.id];
    if (!trackData?.inProgress) return null;
    const node       = careerRes.track.nodes.find(n => n.id === trackData.inProgress);
    if (!node) return null;
    const checkedCount = (trackData.challenges?.[node.id] ?? []).length;
    const totalCount   = node.challenges.length;
    return { node, checkedCount, totalCount, track: careerRes.track };
  }, [dashboardData?.state?.metadata, careerRes.track]);

  /** Supabase `user_dashboard_items` — when present, show registry widgets instead of the static career map only. */
  const hasDashboardWidgets = (dashboardData?.items ?? []).some(i => i.visible);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  /** Reload `user_skills` when switching to Dashboard or Skill Tree so XP matches Tasks / DB. */
  useEffect(() => {
    const prev = prevNavTab.current;
    prevNavTab.current = navTab;
    if (
      prev !== null &&
      prev !== navTab &&
      (navTab === "Dashboard" || navTab === "Skill Tree")
    ) {
      void syncSkillsFromDb();
    }
  }, [navTab, syncSkillsFromDb]);

  /** Overdue follow-up badge — count sent messages with follow_up_at in the past. */
  useEffect(() => {
    const sb = createClient();
    const fetchOverdue = async () => {
      const { count } = await sb
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "sent")
        .not("follow_up_at", "is", null)
        .lt("follow_up_at", new Date().toISOString());
      setOverdueCount(count ?? 0);
    };
    void fetchOverdue();
  }, []);

const signOut = async () => { await createClient().auth.signOut(); router.push("/"); };

  return (
    <DashboardSkillsSyncProvider syncSkillsFromDb={syncSkillsFromDb}>
    <div className="flex flex-col h-screen min-h-0 overflow-hidden" style={{ background: "#080e1a", color: "#e2e8f0" }}>

      {/* ── Nav ── */}
      <nav className="flex items-center gap-1 px-6 flex-shrink-0"
        style={{ background: "rgba(4,9,24,0.95)", backdropFilter: "blur(8px)", borderBottom: "2px solid #1a2744", height: "54px" }}>

        <Link href="/" className="flex items-center gap-2 mr-6">
          <span className="text-lg">🌱</span>
          <span style={{ fontFamily: PF, fontSize: "11px", color: "#fff" }}>ROOTED</span>
        </Link>

        {NAV_TABS.map(tab => {
          const active = navTab === tab;
          const badge = tab === "Community" && overdueCount > 0 && navTab !== "Community";
          return (
            <button key={tab} onClick={() => setNavTab(tab)}
              className="relative h-full px-3 transition-colors"
              style={{
                color: active ? "#e2e8f0" : "#64748b",
                fontFamily: active ? PF : "inherit",
                fontSize: active ? "8px" : "13px",
                background: "none", border: "none", cursor: "pointer",
                marginBottom: "-2px",
              }}>
              {tab}
              {badge && (
                <span style={{
                  position: "absolute", top: "10px", right: "2px",
                  background: "#ef4444", color: "#fff",
                  fontSize: "9px", fontFamily: "inherit", fontWeight: 700,
                  borderRadius: "999px", minWidth: "16px", height: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px", lineHeight: 1,
                }}>
                  {overdueCount > 9 ? "9+" : overdueCount}
                </span>
              )}
              {active && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#6ED640" }} />}
            </button>
          );
        })}

        {/* Level / XP — same math as career-map CPU (`user_skills` sum, 200 XP per level) */}
        <div
          className="hidden sm:flex flex-col justify-center flex-shrink-0 px-3 py-1 max-w-[200px]"
          style={{ borderLeft: "2px solid #1a2744", background: "rgba(6,12,24,0.75)" }}
          title="Total XP and level from all skills — matches the CPU on your career map"
        >
          <div className="flex items-center gap-3 flex-wrap" style={{ fontFamily: PF, fontSize: "11px" }}>
            <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>
              LV <span style={{ color: "#78E04A" }}>{level}</span>
            </span>
            <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>
              <span style={{ color: "#cbd5e1" }}>{totalXp}</span>
              <span style={{ color: "#475569" }}> XP</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 min-w-[72px] h-1.5 rounded-sm" style={{ background: "#162238", border: "1px solid #1e3858" }}>
              <motion.div
                key={totalXp}
                className="h-full rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgressPct}%` }}
                transition={{ duration: 0.9 }}
                style={{ background: "linear-gradient(90deg,#3A9018,#6ED640)" }}
              />
            </div>
            <span style={{ fontFamily: PF, fontSize: "13px", color: "#475569", flexShrink: 0 }}>
              {xpIntoLevel}/{XP_PER_LEVEL}
            </span>
          </div>
        </div>

        <div className="flex sm:hidden items-center flex-shrink-0 px-2" style={{ fontFamily: PF, fontSize: "10px", color: "#64748b" }}>
          LV <span style={{ color: "#78E04A", marginRight: 6 }}>{level}</span>
          <span style={{ color: "#cbd5e1" }}>{totalXp}</span>
          <span style={{ color: "#475569" }}> XP</span>
        </div>

        <div className="flex-1" />

        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", opacity: 0.45, marginRight: "4px" }}>🔍</button>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", opacity: 0.45, marginRight: "12px" }}>⚙️</button>

        {avatar
          ? /* eslint-disable-next-line @next/next/no-img-element -- remote user URLs; avoid domain allowlist */
            <img src={avatar} alt={name} className="w-8 h-8"
              style={{ border: "2px solid #3A9018", borderRadius: 0 }} />
          : avatarType
          ? <div style={{ border: "2px solid #3A9018", lineHeight: 0 }}>
              <PixelAvatar avatarId={avatarType} size={32} />
            </div>
          : <div className="w-8 h-8 flex items-center justify-center"
              style={{ background: "#122040", border: "2px solid #1e3a6a", fontFamily: PF, fontSize: "10px", color: "#6ED640" }}>
              {name[0].toUpperCase()}
            </div>
        }

        <button onClick={signOut} className="ml-3 transition-colors"
          style={{ fontFamily: PF, fontSize: "11px", color: "#475569", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#6ED640")}
          onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
          Sign out
        </button>
      </nav>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {navTab === "Community" ? (
          <CommunityHub user={user} />
        ) : navTab === "Balance" ? (
          <BalanceView user={user} />
        ) : navTab === "Resume" ? (
          <ResumeAnalyzer
            onViewNode={(nodeId) => {
              setNavTab("Skill Tree");
              // Small delay so the Skill Tree tab mounts before the node event
              setTimeout(() => {
                setTasksFromSkillTree({ nodeId, skillKey: nodeId.split("_")[0] ?? nodeId, nodeLabel: nodeId.replace(/_/g, " ") });
              }, 100);
            }}
          />
        ) : navTab === "Tasks" ? (
          <TaskPage
            onSkillsUpdated={syncSkillsFromDb}
            skillTreeFocus={tasksFromSkillTree}
            onConsumedSkillTreeFocus={clearTasksFromSkillTree}
          />
        ) : (
        <>
        {/* Left: canvas + recommended panel OR skill tree */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

          {navTab === "Skill Tree" && (
            <SkillTree
              key={careerRes.track.id}
              user={user}
              dashboardState={dashboardData?.state ?? null}
              accountSkillXpTotal={totalXp}
              onContinueToTasks={payload => {
                setTasksFromSkillTree(payload);
                setNavTab("Tasks");
              }}
            />
          )}

          {navTab !== "Skill Tree" && <>
          {/* Career map: DB-driven widgets from `user_dashboard_items`, or static CpuArchitecture */}
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {hasDashboardWidgets && dashboardData ? (
              <DashboardRenderer user={user} dashboardData={dashboardData} liveSkills={skillRows} />
            ) : (
              <CpuArchitecture
                careerTitle={careerLabel}
                focusSkillKey={cpuFocusSkillKey}
                username={name}
                level={level}
                xp={xpIntoLevel}
                maxXp={XP_PER_LEVEL}
                totalSkillXp={totalXp}
                userSkills={skills}
              />
            )}
          </div>

          {/* Currently Learning banner */}
          {currentlyLearning && (
            <div
              className="flex-shrink-0 px-5 py-3 flex items-center gap-4"
              style={{ background: "rgba(251,191,36,0.06)", borderTop: "2px solid #FBBF2433" }}
            >
              <span style={{ fontSize: "22px", flexShrink: 0 }}>{currentlyLearning.node.icon}</span>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: PF, fontSize: "9px", color: "#FBBF24", marginBottom: "3px" }}>
                  ⚡ CURRENTLY LEARNING
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span style={{ fontFamily: PF, fontSize: "9px", color: "#e2e8f0" }}>
                    {currentlyLearning.node.label}
                  </span>
                  <span style={{ fontFamily: PF, fontSize: "9px", color: "#475569" }}>
                    {currentlyLearning.checkedCount}/{currentlyLearning.totalCount} challenges
                  </span>
                  {/* mini progress bar */}
                  <div style={{ width: 80, height: 4, background: "#1a2744", borderRadius: 2, flexShrink: 0 }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      background: "#FBBF24",
                      width: currentlyLearning.totalCount > 0
                        ? `${Math.round((currentlyLearning.checkedCount / currentlyLearning.totalCount) * 100)}%`
                        : "0%",
                      transition: "width 0.4s",
                    }} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNavTab("Skill Tree")}
                style={{
                  fontFamily: PF, fontSize: "9px", flexShrink: 0,
                  background: "rgba(251,191,36,0.12)", color: "#FBBF24",
                  border: "1px solid #FBBF2444", padding: "6px 10px", cursor: "pointer",
                }}
              >
                Open ▶
              </button>
            </div>
          )}

          {/* Most Recommended panel */}
          <div className="flex-shrink-0 px-5 py-4 overflow-y-auto"
            style={{ background: "#060c18", borderTop: "2px solid #1a2744", height: "210px" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ ...LABEL_STYLE, color: "#FBBF24" }}>★ Most Recommended</span>
              <button style={{ fontFamily: PF, fontSize: "11px", color: "#475569", background: "none", border: "none", cursor: "pointer" }}>
                View All &gt;
              </button>
            </div>
            {recommendedTasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-3 py-2"
                style={{ borderTop: i > 0 ? "1px solid #1a2744" : "none" }}>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: "#0d1a2e", border: "2px solid #1e3858" }}>
                  {task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#cbd5e1" }}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{
                      background: DIFF_COLOR[task.diff] + "22", color: DIFF_COLOR[task.diff],
                      fontFamily: PF, fontSize: "10px", padding: "2px 5px",
                      border: `1px solid ${DIFF_COLOR[task.diff]}44`,
                    }}>{task.diff}</span>
                    <span className="text-xs" style={{ color: "#475569" }}>⏱ +{task.mins} min</span>
                  </div>
                </div>
                <span style={{ fontFamily: PF, fontSize: "12px", color: "#6ED640", flexShrink: 0 }}>+{task.xp} XP</span>
                {i === 0 && (
                  <button className="flex-shrink-0 hover:brightness-110 transition-all active:scale-95"
                    style={PIXEL_BTN_STYLE()}>
                    Start Task
                  </button>
                )}
              </div>
            ))}
          </div>
          </>}
        </div>

        {/* Right sidebar */}
        <div className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ width: "320px", background: "#060c18", borderLeft: "2px solid #1a2744" }}>

          {/* User card */}
          <div className="p-5" style={{ borderBottom: "2px solid #1a2744" }}>

            {/* Avatar — centrepiece */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-3">
                {avatarType
                  ? <div style={{ border: "3px solid #3A9018", lineHeight: 0,
                        boxShadow: "0 0 18px rgba(110,214,64,0.35), 0 0 6px rgba(110,214,64,0.6)" }}>
                      <PixelAvatar avatarId={avatarType} size={96} />
                    </div>
                  : avatar
                  ? /* eslint-disable-next-line @next/next/no-img-element -- remote user URLs */
                    <img src={avatar} alt={name}
                      style={{ width: 96, height: 96, display: "block", border: "3px solid #3A9018", borderRadius: 0,
                        boxShadow: "0 0 18px rgba(110,214,64,0.35)" }} />
                  : <div className="flex items-center justify-center"
                      style={{ width: 96, height: 96, background: "#122040", border: "3px solid #1e3a6a",
                        fontFamily: PF, fontSize: "28px", color: "#6ED640" }}>
                      {name[0].toUpperCase()}
                    </div>
                }
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 flex items-center justify-center"
                  style={{ background: "#FBBF24", border: "2px solid #0a1428", width: 28, height: 28,
                    fontFamily: PF, fontSize: "11px", color: "#0a1428" }}>
                  {level}
                </div>
              </div>

              <span style={{ fontFamily: PF, fontSize: "10px", color: "#f1f5f9", marginBottom: "4px" }}>{name}</span>
              {goalLabel && (
                <span className="text-xs" style={{ color: "#6ED640", fontFamily: PF, fontSize: "10px",
                  background: "rgba(110,214,64,0.1)", border: "1px solid rgba(110,214,64,0.25)",
                  padding: "3px 8px", marginBottom: "2px" }}>
                  {goalLabel}
                </span>
              )}
              <span className="text-xs" style={{ color: "#475569" }}>{careerLabel}</span>

              {/* Career journey progress bar */}
              <div className="w-full mt-3">
                <div className="flex justify-between mb-1">
                  <span style={{ fontFamily: PF, fontSize: "9px", color: "#334155" }}>Career Progress</span>
                  <span style={{ fontFamily: PF, fontSize: "9px", color: careerReadinessPct >= 80 ? "#6ED640" : careerReadinessPct >= 40 ? "#FBBF24" : "#475569" }}>
                    {careerReadinessPct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-sm overflow-hidden" style={{ background: "#162238", border: "1px solid #1e3858" }}>
                  <motion.div
                    key={careerReadinessPct}
                    className="h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${careerReadinessPct}%` }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    style={{
                      background: careerReadinessPct >= 80
                        ? "linear-gradient(90deg,#3A9018,#6ED640)"
                        : careerReadinessPct >= 40
                        ? "linear-gradient(90deg,#b45309,#FBBF24)"
                        : "linear-gradient(90deg,#1e3a6a,#3b82f6)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* XP bar: width = (sum of skill tree XP mod 200) / 200 — same pool as Skill Tree */}
            <div className="h-3 w-full" style={{ background: "#162238", border: "1px solid #1e3858" }}>
              <motion.div
                key={totalXp}
                className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgressPct}%` }}
                transition={{ duration: 1.2, delay: 0.3 }}
                style={{ background: "linear-gradient(90deg,#3A9018,#6ED640)" }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span style={{ fontFamily: PF, fontSize: "10px", color: "#334155" }}>{totalXp} XP</span>
              <span style={{ fontFamily: PF, fontSize: "10px", color: "#334155" }}>
                {xpIntoLevel}/{XP_PER_LEVEL} · Lv {level}
              </span>
            </div>
          </div>

          {/* Balance tip */}
          <div className="p-5" style={{ borderBottom: "2px solid #1a2744" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ ...LABEL_STYLE, color: "#FBBF24" }}>★ Balance Tip</span>
              <button style={{ fontFamily: PF, fontSize: "11px", color: "#475569", background: "none", border: "none", cursor: "pointer" }}>
                View All &gt;
              </button>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#64748b" }}>
              {balanceTipText}
            </p>
            <div className="flex gap-2">
              <button className="flex-1 text-center hover:brightness-110 transition-all active:scale-95"
                style={PIXEL_BTN_STYLE()}>
                OK!
              </button>
              <button className="flex-1 text-center hover:brightness-110 transition-all active:scale-95"
                style={PIXEL_BTN_STYLE("#122040", "#1e3a6a", "#06111e")}>
                Push Harder!
              </button>
            </div>
          </div>

          {/* Tasks panel */}
          <div className="flex-1 p-5 overflow-y-auto">
            {/* Tab row */}
            <div className="flex mb-4" style={{ borderBottom: "2px solid #1a2744" }}>
              {TASK_TABS.map(tab => {
                const active = taskTab === tab;
                return (
                  <button key={tab} onClick={() => setTaskTab(tab)}
                    className="relative flex-1 py-2 text-center"
                    style={{
                      fontFamily: PF, fontSize: "10px",
                      color: active ? "#e2e8f0" : "#475569",
                      background: "none", border: "none",
                      cursor: "pointer", marginBottom: "-2px",
                    }}>
                    {tab}
                    {active && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#6ED640" }} />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span style={{ ...HEADING_STYLE, fontSize: "10px" }}>Tasks</span>
              <button style={{ fontFamily: PF, fontSize: "11px", color: "#475569", background: "none", border: "none", cursor: "pointer" }}>
                View All &gt;
              </button>
            </div>

            {sidebarTasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-3 py-2.5"
                style={{ borderTop: i > 0 ? "1px solid #1a2744" : "none" }}>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ background: "#0d1a2e", border: "2px solid #1e3858" }}>
                  <span className="text-base">{task.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#cbd5e1" }}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{
                      background: DIFF_COLOR[task.diff] + "22", color: DIFF_COLOR[task.diff],
                      fontFamily: PF, fontSize: "10px", padding: "2px 5px",
                      border: `1px solid ${DIFF_COLOR[task.diff]}44`,
                    }}>{task.diff}</span>
                    <span className="text-xs" style={{ color: "#475569" }}>⏱ {task.mins} min</span>
                  </div>
                </div>
                <span style={{ fontFamily: PF, fontSize: "11px", color: "#6ED640", flexShrink: 0 }}>+{task.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
    </DashboardSkillsSyncProvider>
  );
}
