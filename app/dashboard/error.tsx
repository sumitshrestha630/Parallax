"use client";

import { useEffect } from "react";

const PF = "'Press Start 2P', monospace";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  const isMissingTable = error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("relation");

  return (
    <div style={{ background: "#080e1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <p style={{ fontSize: 36, marginBottom: 16 }}>💥</p>
        <h1 style={{ fontFamily: PF, fontSize: 13, color: "#fbbf24", marginBottom: 16 }}>
          Dashboard Error
        </h1>
        {isMissingTable ? (
          <div style={{ background: "#0d1a2e", border: "1px solid #1e3858", padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
            <p style={{ fontFamily: PF, fontSize: 10, color: "#f472b6", marginBottom: 8 }}>
              Missing database table
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, marginBottom: 8 }}>
              A required Supabase table is missing. Run the migrations in{" "}
              <code style={{ color: "#a5f3fc" }}>supabase/migrations/</code> via the Supabase SQL editor.
            </p>
            <p style={{ fontFamily: PF, fontSize: 9, color: "#475569" }}>
              {error.message}
            </p>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
            {error.message ?? "An unexpected error occurred loading the dashboard."}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            fontFamily: PF,
            fontSize: 11,
            background: "#6ED640",
            border: "3px solid #3A9018",
            color: "#0a1a06",
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
