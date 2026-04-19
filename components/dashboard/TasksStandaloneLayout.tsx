"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaskPage } from "@/components/dashboard/TaskPage";
import type { TasksUrlHandoff } from "@/types/dashboard";

const PF = "'Press Start 2P', monospace";

export function TasksStandaloneLayout({ urlHandoff }: { urlHandoff: TasksUrlHandoff | null }) {
  const router = useRouter();
  const sync = useCallback(async () => {
    router.refresh();
  }, [router]);

  return (
    <div className="flex flex-col h-screen min-h-0 overflow-hidden" style={{ background: "#080e1a" }}>
      <nav
        className="flex-shrink-0 flex items-center justify-between gap-4 px-6 py-3 border-b-2 border-[#1a2744]"
        style={{ background: "rgba(4,9,24,0.95)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" style={{ fontFamily: PF, fontSize: "12px", color: "#64748b" }}>
            ← Dashboard
          </Link>
          <span style={{ fontFamily: PF, fontSize: "10px", color: "#78E04A" }}>TASKS</span>
        </div>
        <Link href="/" style={{ fontFamily: PF, fontSize: "11px", color: "#475569" }}>
          Rooted home
        </Link>
      </nav>
      <TaskPage onSkillsUpdated={sync} urlHandoff={urlHandoff} />
    </div>
  );
}
