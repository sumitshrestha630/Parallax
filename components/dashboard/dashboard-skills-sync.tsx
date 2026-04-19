"use client";

import React, { createContext, useContext } from "react";

export type DashboardSkillsSyncFn = () => Promise<void>;

const Ctx = createContext<DashboardSkillsSyncFn | null>(null);

export function DashboardSkillsSyncProvider({
  children,
  syncSkillsFromDb,
}: {
  children: React.ReactNode;
  syncSkillsFromDb: DashboardSkillsSyncFn;
}) {
  return <Ctx.Provider value={syncSkillsFromDb}>{children}</Ctx.Provider>;
}

export function useDashboardSkillsSync(): DashboardSkillsSyncFn | null {
  return useContext(Ctx);
}
