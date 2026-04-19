/**
 * Component registry.
 *
 * Maps a database `component_key` to the actual React component plus a
 * function that merges saved `props` with live context data (skills, user, etc.).
 *
 * To add a new dashboard widget:
 *   1. Add its key to `dashboard_components` in Supabase (once).
 *   2. Create the React component.
 *   3. Add an entry below.
 */

import React from "react";
import type { ComponentType } from "react";
import type { User } from "@supabase/supabase-js";
import type { ComponentKey, DashboardContext, UserDashboardItem } from "@/types/dashboard";
import { skillsToNodes } from "@/lib/dashboard/dashboard-service";

// Lazy imports keep the bundle lean
const SkillTree        = React.lazy(() => import("@/components/ui/skill-tree").then(m => ({ default: m.SkillTree })));
const CpuArchitecture  = React.lazy(() => import("@/components/ui/cpu-architecture").then(m => ({ default: m.CpuArchitecture })));

// ── Placeholder for unbuilt widgets ──────────────────────────────────────────

function PlaceholderWidget({ name }: { name: string }) {
  return React.createElement(
    "div",
    {
      className: "flex items-center justify-center w-full h-full",
      style: { background: "#060c18", border: "2px dashed #1a2744", color: "#334155", fontFamily: "'Press Start 2P', monospace", fontSize: "8px" },
    },
    `[ ${name} ]`
  );
}

// ── Registry entry type ───────────────────────────────────────────────────────

interface RegistryEntry {
  /** The React component to render. */
  component: ComponentType<Record<string, unknown>>;
  /** Merge saved DB props with live context; return the final props object. */
  resolveProps: (
    item: UserDashboardItem,
    context: DashboardContext,
    user: User
  ) => Record<string, unknown>;
}

// ── Registry map ─────────────────────────────────────────────────────────────

const registry: Record<ComponentKey, RegistryEntry> = {
  career_map: {
    component: CpuArchitecture as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context, user) => {
      const xpPerLevel = 200;
      const inLevelXp = context.totalXp % xpPerLevel;
      return {
        careerTitle: context.careerTrackLabel,
        focusSkillKey: context.cpuFocusSkillKey,
        level:       Math.max(1, Math.floor(context.totalXp / xpPerLevel) + 1),
        xp:          inLevelXp,
        maxXp:       xpPerLevel,
        totalSkillXp: context.totalXp,
        userSkills: context.skills,
        ...item.props,
      };
    },
  },

  skill_tree: {
    component: SkillTree as unknown as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context, user) => ({
      user,
      dashboardState: context.state,
      accountSkillXpTotal: context.totalXp,
      ...item.props,
    }),
  },

  stats_card: {
    component: (({ totalXp, username }: Record<string, unknown>) =>
      React.createElement(PlaceholderWidget, { name: `Stats · ${totalXp} XP` })
    ) as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context) => ({
      totalXp:  context.totalXp,
      username: context.username,
      skills:   context.skills,
      ...item.props,
    }),
  },

  dashboard_pills: {
    component: ((_props: Record<string, unknown>) =>
      React.createElement(PlaceholderWidget, { name: "Dashboard Pills" })
    ) as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context) => ({
      nodes: skillsToNodes(context.skills),
      ...item.props,
    }),
  },

  achievement_panel: {
    component: ((_props: Record<string, unknown>) =>
      React.createElement(PlaceholderWidget, { name: "Achievements" })
    ) as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context) => ({
      achievements: context.achievements,
      ...item.props,
    }),
  },

  mentor_matches: {
    component: ((_props: Record<string, unknown>) =>
      React.createElement(PlaceholderWidget, { name: "Mentor Matches" })
    ) as ComponentType<Record<string, unknown>>,
    resolveProps: (item, _context) => ({ ...item.props }),
  },

  roadmap_progress: {
    component: ((_props: Record<string, unknown>) =>
      React.createElement(PlaceholderWidget, { name: "Roadmap Progress" })
    ) as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context) => ({
      skills:   context.skills,
      totalXp:  context.totalXp,
      ...item.props,
    }),
  },

  task_overview: {
    component: ((_props: Record<string, unknown>) =>
      React.createElement(PlaceholderWidget, { name: "Task Overview" })
    ) as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context) => ({
      taskSummary: context.taskSummary,
      ...item.props,
    }),
  },

  daily_tasks: {
    component: ((_props: Record<string, unknown>) =>
      React.createElement(PlaceholderWidget, { name: "Daily Tasks" })
    ) as ComponentType<Record<string, unknown>>,
    resolveProps: (item, context) => ({
      taskSummary: context.taskSummary,
      ...item.props,
    }),
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns the registry entry for a key, or undefined if not registered. */
export function getRegistryEntry(key: string): RegistryEntry | undefined {
  return registry[key as ComponentKey];
}

/** Resolves a component + its final props from a dashboard item + context. */
export function resolveComponent(
  item: UserDashboardItem,
  context: DashboardContext,
  user: User
): { Component: ComponentType<Record<string, unknown>>; props: Record<string, unknown> } {
  const entry = getRegistryEntry(item.component_key);
  if (!entry) {
    return {
      Component: (() =>
        React.createElement(PlaceholderWidget, { name: item.component_key })
      ) as ComponentType<Record<string, unknown>>,
      props: {},
    };
  }
  return {
    Component: entry.component,
    props: entry.resolveProps(item, context, user),
  };
}
