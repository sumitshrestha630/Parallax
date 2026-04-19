"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NodeTaskSession } from "@/components/dashboard/NodeTaskSession";

const PF = "'Press Start 2P', monospace";

export function TasksNodeStandaloneLayout({
  nodeId,
  skillLane,
  nodeLabel,
  source,
}: {
  nodeId: string;
  skillLane: string;
  nodeLabel?: string;
  source?: string;
}) {
  const router = useRouter();
  const sync = useCallback(async () => {
    router.refresh();
  }, [router]);

  const listHref =
    `/tasks?node=${encodeURIComponent(nodeId)}` +
    `&skill=${encodeURIComponent(skillLane)}` +
    (nodeLabel ? `&label=${encodeURIComponent(nodeLabel)}` : "") +
    (source ? `&source=${encodeURIComponent(source)}` : "");

  return (
    <div className="flex flex-col h-screen min-h-0 overflow-hidden" style={{ background: "#080e1a" }}>
      <nav
        className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 border-b-2 border-[#1a2744]"
        style={{ background: "rgba(4,9,24,0.95)" }}
      >
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <Link href="/dashboard" style={{ fontFamily: PF, fontSize: "12px", color: "#64748b" }}>
            ← Dashboard
          </Link>
          <span style={{ fontFamily: PF, fontSize: "10px", color: "#78E04A" }}>NODE TASK</span>
          <Link href={listHref} style={{ fontFamily: PF, fontSize: "11px", color: "#60A5FA" }}>
            All tasks in lane →
          </Link>
        </div>
        <Link href="/" style={{ fontFamily: PF, fontSize: "11px", color: "#475569" }}>
          Rooted home
        </Link>
      </nav>
      <NodeTaskSession
        nodeId={nodeId}
        skillLane={skillLane}
        nodeLabel={nodeLabel}
        source={source}
        onSkillsUpdated={sync}
      />
    </div>
  );
}
