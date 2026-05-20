"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResumeAnalysisResult, TargetRole } from "@/types/resume";
import { TARGET_ROLE_LABELS } from "@/types/resume";

const PF = "'Press Start 2P', monospace";

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "#6ED640" : s >= 60 ? "#FBBF24" : s >= 40 ? "#f97316" : "#F472B6";

const SCORE_LABEL = (s: number) =>
  s >= 80 ? "Strong Candidate" :
  s >= 60 ? "Solid Foundation" :
  s >= 40 ? "Good Start" :
  "Early Stage";

const MOTIVATIONAL: Record<string, string> = {
  software_engineer: "Every great engineer started exactly where you are. Let's close these gaps. 🚀",
  frontend_developer: "Your frontend journey is taking shape. A few more skills and you're interview-ready. ⚡",
  backend_developer: "Solid backend instincts — now let's sharpen your technical edge. 🖥️",
  data_analyst: "Data tells stories. Let's make yours more compelling to hiring managers. 📊",
  ux_designer: "Great design starts with empathy. You're building the right foundation. 🎨",
  product_manager: "Product leaders are made, not born. Here's your next level-up plan. 🗺️",
};

interface Props {
  onViewNode?: (nodeId: string) => void;
}

export function ResumeAnalyzer({ onViewNode }: Props) {
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState<TargetRole>("software_engineer");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canAnalyze = loading
    ? false
    : inputMode === "paste"
    ? resumeText.trim().length >= 50
    : !!file;

  async function handleAnalyze() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("targetRole", targetRole);
      if (inputMode === "upload" && file) {
        form.append("file", file);
      } else {
        form.append("resumeText", resumeText);
      }
      const res = await fetch("/api/resume/analyze", { method: "POST", body: form });
      const data = await res.json() as { result?: ResumeAnalysisResult; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Analysis failed");
      setResult(data.result!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const panelBase: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(8,14,26,0.96) 100%)",
    border: "2px solid rgba(30,56,88,0.8)",
    boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.08)",
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-y-auto"
      style={{ background: "linear-gradient(180deg,#0a1220 0%,#080e1a 100%)", color: "#e2e8f0" }}
    >
      {/* Header */}
      <header className="flex-shrink-0 px-6 pt-6 pb-4" style={{ borderBottom: "2px solid rgba(251,191,36,0.15)" }}>
        <div className="flex items-center gap-3 mb-1">
          <span style={{ fontSize: 22 }}>🎯</span>
          <h1 style={{ fontFamily: PF, fontSize: 13, color: "#FBBF24" }}>Resume Analyzer</h1>
        </div>
        <p className="text-sm" style={{ color: "#475569" }}>
          Upload or paste your resume · get an instant score + skill gap analysis · level up your career
        </p>
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row gap-0">

        {/* ── Left: input panel ── */}
        <div className="flex-shrink-0 w-full lg:w-[420px] p-5 flex flex-col gap-5" style={{ borderRight: "1px solid #1a2744" }}>

          {/* Target role */}
          <div style={panelBase} className="p-4 rounded-sm">
            <p style={{ fontFamily: PF, fontSize: 10, color: "#6ED640", marginBottom: 10 }}>▸ TARGET ROLE</p>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value as TargetRole)}
              style={{
                width: "100%", background: "#0d1a2e", border: "2px solid #1e3858",
                color: "#e2e8f0", padding: "10px 12px", fontFamily: "inherit", fontSize: 13,
                cursor: "pointer", outline: "none",
              }}
            >
              {(Object.keys(TARGET_ROLE_LABELS) as TargetRole[]).map(role => (
                <option key={role} value={role}>{TARGET_ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>

          {/* Input mode toggle */}
          <div style={panelBase} className="p-4 rounded-sm">
            <div className="flex gap-2 mb-4">
              {(["paste", "upload"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  style={{
                    fontFamily: PF, fontSize: 9, flex: 1, padding: "8px 10px",
                    background: inputMode === mode ? "#6ED640" : "#0d1a2e",
                    border: `2px solid ${inputMode === mode ? "#3A9018" : "#1e3858"}`,
                    color: inputMode === mode ? "#0a1a06" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {mode === "paste" ? "✏️ PASTE TEXT" : "📄 UPLOAD PDF"}
                </button>
              ))}
            </div>

            {inputMode === "paste" ? (
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here..."
                rows={14}
                style={{
                  width: "100%", background: "#060c18", border: "2px solid #1e3858",
                  color: "#cbd5e1", padding: "12px", fontFamily: "ui-monospace, monospace",
                  fontSize: 12, lineHeight: 1.65, resize: "vertical", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${file ? "#6ED640" : "#1e3858"}`,
                  background: "#060c18", padding: "32px 16px", textAlign: "center",
                  cursor: "pointer", transition: "border-color 0.2s",
                }}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setFile(f); }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
                <p style={{ fontSize: 28, marginBottom: 8 }}>{file ? "✅" : "📁"}</p>
                <p style={{ fontFamily: PF, fontSize: 9, color: file ? "#6ED640" : "#475569" }}>
                  {file ? file.name : "DRAG & DROP PDF OR CLICK TO BROWSE"}
                </p>
                {file && (
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={() => void handleAnalyze()}
            disabled={!canAnalyze}
            style={{
              fontFamily: PF, fontSize: 12, padding: "16px",
              background: canAnalyze ? "#6ED640" : "#1a2744",
              border: `3px solid ${canAnalyze ? "#3A9018" : "#2a3a54"}`,
              boxShadow: canAnalyze ? "0 5px 0 #1E6010, 0 7px 0 rgba(0,0,0,0.35)" : "none",
              color: canAnalyze ? "#0a1a06" : "#334155",
              cursor: canAnalyze ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {loading ? "⏳ ANALYZING..." : "🎯 ANALYZE MY RESUME"}
          </button>

          {error && (
            <div style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.3)", padding: "12px 16px" }}>
              <p style={{ fontFamily: PF, fontSize: 9, color: "#F472B6", marginBottom: 4 }}>ERROR</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ ...panelBase, padding: 16 }} className="rounded-sm space-y-3">
              <p style={{ fontFamily: PF, fontSize: 9, color: "#475569" }}>🤖 Our Bot is reading your resume...</p>
              {[80, 60, 70, 50].map((w, i) => (
                <div key={i} className="h-2 rounded-sm animate-pulse" style={{ width: `${w}%`, background: "#1e3858" }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: results panel ── */}
        <div className="flex-1 min-w-0 p-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-5"
              >
                {/* Score hero */}
                <div
                  className="flex items-center gap-6 p-6 rounded-sm"
                  style={{
                    background: `linear-gradient(135deg, ${SCORE_COLOR(result.score)}14, #060c18)`,
                    border: `2px solid ${SCORE_COLOR(result.score)}44`,
                    boxShadow: `0 0 24px ${SCORE_COLOR(result.score)}18`,
                  }}
                >
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
                      style={{ fontFamily: PF, fontSize: 42, color: SCORE_COLOR(result.score), lineHeight: 1 }}
                    >
                      {result.score}
                    </motion.div>
                    <div style={{ fontFamily: PF, fontSize: 9, color: "#475569", marginTop: 4 }}>/ 100</div>
                  </div>
                  <div>
                    <p style={{ fontFamily: PF, fontSize: 11, color: SCORE_COLOR(result.score), marginBottom: 6 }}>
                      {SCORE_LABEL(result.score)}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                      {result.feedbackSummary}
                    </p>
                    <p className="text-xs mt-2" style={{ color: "#475569", fontStyle: "italic" }}>
                      {MOTIVATIONAL[targetRole]}
                    </p>
                  </div>
                </div>

                {/* 2-col grid for strengths / weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResultSection
                    title="✅ Strengths"
                    color="#6ED640"
                    items={result.strengths}
                    pillBg="rgba(110,214,64,0.1)"
                    pillBorder="rgba(110,214,64,0.3)"
                  />
                  <ResultSection
                    title="⚠️ Weaknesses"
                    color="#FBBF24"
                    items={result.weaknesses}
                    pillBg="rgba(251,191,36,0.08)"
                    pillBorder="rgba(251,191,36,0.25)"
                  />
                </div>

                {/* Missing skills */}
                {result.missingSkills.length > 0 && (
                  <SectionCard title="🧩 Missing Skills" accentColor="#F472B6">
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          style={{
                            fontFamily: PF, fontSize: 9, padding: "5px 10px",
                            background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.3)",
                            color: "#F472B6",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Improvements */}
                {result.improvements.length > 0 && (
                  <SectionCard title="💡 How to Improve" accentColor="#a5f3fc">
                    <ol className="flex flex-col gap-3">
                      {result.improvements.map((imp, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <span style={{ fontFamily: PF, fontSize: 9, color: "#334466", flexShrink: 0, marginTop: 2 }}>
                            {String(i + 1).padStart(2, "0")}.
                          </span>
                          <p className="text-sm" style={{ color: "#94a3b8", lineHeight: 1.65 }}>{imp}</p>
                        </li>
                      ))}
                    </ol>
                  </SectionCard>
                )}

                {/* Recommended tasks */}
                {result.recommendedTasks.length > 0 && (
                  <SectionCard title="🎮 Recommended Tasks — Complete These to Level Up" accentColor="#6ED640">
                    <div className="flex flex-col gap-3">
                      {result.recommendedTasks.map((task, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-sm"
                          style={{ background: "#0d1a2e", border: "1px solid #1e3858" }}
                        >
                          <div style={{
                            background: DIFF_COLOR[task.difficulty] + "22", border: `1px solid ${DIFF_COLOR[task.difficulty]}44`,
                            color: DIFF_COLOR[task.difficulty], fontFamily: PF, fontSize: 8,
                            padding: "3px 7px", flexShrink: 0, textTransform: "uppercase",
                          }}>
                            {task.difficulty}
                          </div>
                          <p className="flex-1 text-sm" style={{ color: "#cbd5e1" }}>{task.title}</p>
                          {onViewNode && task.relatedNode && (
                            <button
                              onClick={() => onViewNode(task.relatedNode)}
                              style={{
                                fontFamily: PF, fontSize: 8, padding: "5px 8px",
                                background: "#122040", border: "2px solid #1e3a6a",
                                color: "#6ED640", cursor: "pointer", flexShrink: 0,
                              }}
                            >
                              GO →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Skill tree focus nodes */}
                {result.recommendedNodes.length > 0 && (
                  <SectionCard title="🌳 Skill Tree Focus — Your Next Nodes to Unlock" accentColor="#FBBF24">
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(result.recommendedNodes)].map((nodeId, i) => (
                        <button
                          key={i}
                          onClick={() => onViewNode?.(nodeId)}
                          style={{
                            fontFamily: PF, fontSize: 9, padding: "7px 12px",
                            background: "#122040", border: "2px solid #b8860b",
                            color: "#FBBF24", cursor: onViewNode ? "pointer" : "default",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (onViewNode) (e.currentTarget as HTMLElement).style.background = "#1e3a6a"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#122040"; }}
                        >
                          {nodeId.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Re-analyze nudge */}
                <div className="flex justify-center pb-4">
                  <button
                    onClick={() => setResult(null)}
                    style={{
                      fontFamily: PF, fontSize: 9, padding: "10px 18px",
                      background: "none", border: "2px solid #1e3858",
                      color: "#475569", cursor: "pointer",
                    }}
                  >
                    ← Analyze Another Resume
                  </button>
                </div>
              </motion.div>
            ) : !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4"
              >
                <p style={{ fontSize: 48 }}>📋</p>
                <p style={{ fontFamily: PF, fontSize: 11, color: "#334155", textAlign: "center" }}>
                  Your analysis will appear here
                </p>
                <p className="text-sm text-center" style={{ color: "#1e3858", maxWidth: 300 }}>
                  Paste your resume or upload a PDF, choose a target role, and hit Analyze.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

const DIFF_COLOR: Record<string, string> = {
  easy: "#6ED640", medium: "#FBBF24", hard: "#F472B6",
};

function SectionCard({ title, accentColor, children }: {
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-sm p-5"
      style={{
        background: "linear-gradient(180deg, rgba(13,26,46,0.9), rgba(6,12,24,0.95))",
        border: `1px solid ${accentColor}22`,
      }}
    >
      <p style={{ fontFamily: PF, fontSize: 10, color: accentColor, marginBottom: 14 }}>{title}</p>
      {children}
    </div>
  );
}

function ResultSection({ title, color, items, pillBg, pillBorder }: {
  title: string; color: string; items: string[];
  pillBg: string; pillBorder: string;
}) {
  return (
    <SectionCard title={title} accentColor={color}>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 px-3 py-2 rounded-sm text-xs"
            style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: "#94a3b8", lineHeight: 1.6 }}
          >
            {item}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs" style={{ color: "#334155" }}>None detected.</p>}
      </div>
    </SectionCard>
  );
}
