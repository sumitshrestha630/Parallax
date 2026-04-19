"use client";

/**
 * DashboardRenderer – dynamic component engine.
 *
 * Takes `user_dashboard_items` from Supabase and renders each registered
 * component with its saved props merged with live context (skills, user, etc.).
 *
 * This is separate from the main Dashboard layout shell and can be embedded
 * wherever you want registry-driven components to appear.
 *
 * Future: swap the simple flex list for a react-grid-layout grid once
 * drag-and-drop is needed.
 */

import React, { Suspense, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { resolveComponent }   from "@/lib/dashboard/component-registry";
import { buildDashboardContext, debounce } from "@/lib/dashboard/dashboard-service";
import { updateDashboardLayout, updateDashboardProps, toggleDashboardItem, updateSkillProgress, unlockAchievement } from "@/lib/supabase/queries";
import { createClient }       from "@/lib/supabase/client";
import type { DashboardData, UserDashboardItem, DashboardItemLayout, UserSkill } from "@/types/dashboard";
import { useDashboardSkillsSync } from "@/components/dashboard/dashboard-skills-sync";

interface DashboardRendererProps {
  user:          User;
  dashboardData: DashboardData;
  /** Latest `user_skills` from the dashboard shell — keeps widgets and grantXp in sync with the XP bar. */
  liveSkills:    UserSkill[];
}

export function DashboardRenderer({ user, dashboardData, liveSkills }: DashboardRendererProps) {
  const router = useRouter();
  const sb = createClient();
  const syncSkillsFromDb = useDashboardSkillsSync();

  const username = user.user_metadata?.full_name?.split(" ")[0]
    ?? user.email?.split("@")[0]
    ?? "Explorer";

  const mergedData = useMemo(
    () => ({ ...dashboardData, skills: liveSkills }),
    [dashboardData, liveSkills]
  );

  const context = buildDashboardContext(mergedData, username, {
    fallbackCareerId: user.user_metadata?.goal as string | undefined,
  });

  // ── Persist helpers (debounced where appropriate) ──────────────────────────

  const saveLayout = useMemo(
    () =>
      debounce((itemId: string, layout: DashboardItemLayout) => {
        void updateDashboardLayout(sb, itemId, layout);
      }, 600),
    [sb]
  );

  const saveProps = useMemo(
    () =>
      debounce((itemId: string, props: Record<string, unknown>) => {
        void updateDashboardProps(sb, itemId, props);
      }, 600),
    [sb]
  );

  const toggleItem = useCallback((itemId: string, visible: boolean) => {
    void toggleDashboardItem(sb, itemId, visible);
  }, [sb]);

  const grantXp = useCallback(
    async (skillKey: string, xpGrant: number) => {
      const skill = mergedData.skills.find(s => s.skill_key === skillKey);
      if (!skill) return;
      const baseXp   = Number(skill.xp ?? 0);
      const grant    = Number(xpGrant);
      if (!Number.isFinite(baseXp) || !Number.isFinite(grant)) return;
      const newXp    = baseXp + grant;
      const newLevel = Math.max(Number(skill.level ?? 1), Math.floor(newXp / 200) + 1);
      await updateSkillProgress(sb, user.id, skillKey, newXp, newLevel, skill.unlocked);
      await syncSkillsFromDb?.();
      router.refresh();
    },
    [mergedData.skills, user.id, sb, router, syncSkillsFromDb]
  );

  const earnBadge = useCallback(
    async (badgeKey: string, title: string, description?: string) => {
      await unlockAchievement(sb, user.id, badgeKey, title, description);
      await syncSkillsFromDb?.();
      router.refresh();
    },
    [user.id, sb, router, syncSkillsFromDb]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  const visibleItems = dashboardData.items
    .filter(item => item.visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-4 w-full h-full p-4 overflow-y-auto">
      {visibleItems.map(item => {
        const { Component, props } = resolveComponent(item, context, user);

        // Inject live callbacks so components can persist their own state
        const enrichedProps: Record<string, unknown> = {
          ...props,
          onLayoutChange: (layout: DashboardItemLayout) => saveLayout(item.id, layout),
          onPropsChange:  (p: Record<string, unknown>) => saveProps(item.id, p),
          onGrantXp:      grantXp,
          onEarnBadge:    earnBadge,
        };

        return (
          <RenderedItem key={item.id} item={item} onToggle={toggleItem}>
            <Suspense fallback={<ComponentSkeleton />}>
              <Component {...enrichedProps} />
            </Suspense>
          </RenderedItem>
        );
      })}
    </div>
  );
}

// ── Supporting sub-components ─────────────────────────────────────────────────

interface RenderedItemProps {
  item:     UserDashboardItem;
  onToggle: (id: string, visible: boolean) => void;
  children: React.ReactNode;
}

function RenderedItem({ item, onToggle, children }: RenderedItemProps) {
  return (
    <div
      className="relative w-full"
      style={{ minHeight: `${item.layout.h * 60}px` }}
      data-component-key={item.component_key}
      data-item-id={item.id}
    >
      {children}
      {/* Hide button – shown on hover via CSS */}
      <button
        className="absolute top-2 right-2 z-20 opacity-0 hover:opacity-100 transition-opacity"
        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "6px", color: "#334155", background: "none", border: "none", cursor: "pointer" }}
        onClick={() => onToggle(item.id, false)}
        title="Hide widget"
      >
        ✕
      </button>
    </div>
  );
}

function ComponentSkeleton() {
  return (
    <div
      className="w-full h-full animate-pulse"
      style={{ background: "#060c18", border: "1px solid #1a2744", minHeight: "120px" }}
    />
  );
}
