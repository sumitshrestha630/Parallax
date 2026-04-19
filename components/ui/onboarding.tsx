"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AVATARS, PixelAvatar } from "@/components/ui/pixel-avatar";

const PF = "'Press Start 2P', monospace";

const PIXEL_BTN = (
  bg = "#6ED640", border = "#3A9018", shadow = "#1E6010"
): React.CSSProperties => ({
  fontFamily: PF, fontSize: "10px",
  background: bg, border: `3px solid ${border}`,
  boxShadow: `0 5px 0 ${shadow}, 0 7px 0 rgba(0,0,0,0.4)`,
  padding: "12px 28px",
  color: bg === "#6ED640" ? "#0a1a06" : "#6ED640",
  cursor: "pointer", display: "inline-block",
});

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", background: "#0d1a2e",
  border: "2px solid #1e3858", color: "#e2e8f0",
  fontFamily: "inherit", fontSize: "14px",
  padding: "12px 14px", outline: "none", borderRadius: 0,
};

const GOALS = [
  { value: "software_engineer", label: "Software Engineer", icon: "💻" },
  { value: "data_scientist",    label: "Data Scientist",    icon: "📊" },
  { value: "ux_designer",       label: "UX Designer",       icon: "🎨" },
  { value: "product_manager",   label: "Product Manager",   icon: "🗺️" },
  { value: "cybersecurity",     label: "Cybersecurity",     icon: "🛡️" },
  { value: "cloud_engineer",    label: "Cloud Engineer",    icon: "☁️" },
];

const EDUCATION_LEVELS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate Student"];

const STEPS = ["school", "education", "goal", "avatar"] as const;
type Step = typeof STEPS[number];

export function Onboarding({ user }: { user: User }) {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("school");
  const [school, setSchool]       = useState("");
  const [education, setEducation] = useState("");
  const [goal, setGoal]           = useState("");
  const [avatarId, setAvatarId]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const name = user.user_metadata?.full_name?.split(" ")[0]
    ?? user.email?.split("@")[0] ?? "Explorer";

  const stepIndex = STEPS.indexOf(step);
  const progress  = ((stepIndex + 1) / STEPS.length) * 100;

  const canAdvance =
    step === "school"    ? school.trim().length > 0 :
    step === "education" ? education !== "" :
    step === "goal"      ? goal !== "" :
    avatarId !== "";

  const advance = () => {
    if (step === "school")    { setStep("education"); return; }
    if (step === "education") { setStep("goal");      return; }
    if (step === "goal")      { setStep("avatar");    return; }
    handleFinish();
  };

  const handleFinish = async () => {
    setSaving(true); setError("");
    const goalLabel = GOALS.find(g => g.value === goal)?.label ?? goal;
    const { error: err } = await createClient().auth.updateUser({
      data: {
        school, education_level: education,
        goal, goal_label: goalLabel,
        avatar_type: avatarId,
        onboarding_complete: true,
      },
    });
    if (err) { setError(err.message); setSaving(false); return; }
    router.push("/dashboard");
  };

  const selectedAvatar = AVATARS.find(a => a.id === avatarId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#080e1a" }}>

      <div className="flex items-center gap-2 mb-10">
        <span className="text-2xl">🌱</span>
        <span style={{ fontFamily: PF, fontSize: "13px", color: "#fff" }}>ROOTED</span>
      </div>

      <div className="w-full max-w-lg" style={{ background: "#060c18", border: "2px solid #1a2744" }}>

        {/* Progress bar */}
        <div className="h-1.5" style={{ background: "#162238" }}>
          <motion.div className="h-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{ background: "linear-gradient(90deg,#3A9018,#6ED640)" }} />
        </div>

        <div className="p-8">
          <p style={{ fontFamily: PF, fontSize: "8px", color: "#475569", marginBottom: "8px" }}>
            STEP {stepIndex + 1} OF {STEPS.length}
          </p>

          {step === "school" && (
            <p style={{ fontFamily: PF, fontSize: "9px", color: "#6ED640", marginBottom: "20px", letterSpacing: "0.1em" }}>
              ▸ Welcome, {name}!
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              {/* Step 1 — School */}
              {step === "school" && (
                <>
                  <h2 style={{ fontFamily: PF, fontSize: "14px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808", marginBottom: "8px" }}>
                    Where do you<br />study?
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#64748b" }}>
                    We&apos;ll connect you with peers at your school.
                  </p>
                  <input autoFocus type="text"
                    placeholder="e.g. UC Berkeley, Georgia Tech…"
                    value={school} onChange={e => setSchool(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && canAdvance && advance()}
                    style={INPUT_STYLE} />
                </>
              )}

              {/* Step 2 — Education level */}
              {step === "education" && (
                <>
                  <h2 style={{ fontFamily: PF, fontSize: "14px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808", marginBottom: "8px" }}>
                    What year<br />are you?
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#64748b" }}>
                    We&apos;ll tailor your skill path to your timeline.
                  </p>
                  <div className="flex flex-col gap-2">
                    {EDUCATION_LEVELS.map(level => (
                      <button key={level} onClick={() => setEducation(level)}
                        className="text-left px-4 py-3 transition-all"
                        style={{
                          background: education === level ? "#122040" : "#0d1a2e",
                          border: `2px solid ${education === level ? "#6ED640" : "#1e3858"}`,
                          color: education === level ? "#78E04A" : "#94a3b8",
                          fontFamily: education === level ? PF : "inherit",
                          fontSize: education === level ? "9px" : "14px",
                          cursor: "pointer",
                          boxShadow: education === level ? "0 0 8px rgba(110,214,64,0.2)" : "none",
                        }}>
                        {level}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 3 — Goal */}
              {step === "goal" && (
                <>
                  <h2 style={{ fontFamily: PF, fontSize: "14px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808", marginBottom: "8px" }}>
                    What do you<br />want to become?
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#64748b" }}>
                    Pick your career path. You can change this later.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map(g => (
                      <button key={g.value} onClick={() => setGoal(g.value)}
                        className="flex flex-col items-start gap-2 p-4 transition-all"
                        style={{
                          background: goal === g.value ? "#122040" : "#0d1a2e",
                          border: `2px solid ${goal === g.value ? "#6ED640" : "#1e3858"}`,
                          color: goal === g.value ? "#78E04A" : "#94a3b8",
                          cursor: "pointer",
                          boxShadow: goal === g.value ? "0 0 8px rgba(110,214,64,0.2)" : "none",
                        }}>
                        <span className="text-xl">{g.icon}</span>
                        <span style={{
                          fontFamily: goal === g.value ? PF : "inherit",
                          fontSize: goal === g.value ? "7px" : "12px",
                          lineHeight: 1.6, textAlign: "left",
                        }}>
                          {g.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 4 — Avatar */}
              {step === "avatar" && (
                <>
                  <h2 style={{ fontFamily: PF, fontSize: "14px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808", marginBottom: "8px" }}>
                    Choose your<br />character.
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#64748b" }}>
                    Your avatar represents you on your journey.
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {AVATARS.map(def => {
                      const sel = avatarId === def.id;
                      return (
                        <button key={def.id} onClick={() => setAvatarId(def.id)}
                          className="flex flex-col items-center gap-2 p-3 transition-all"
                          style={{
                            background: sel ? "#122040" : "#0d1a2e",
                            border: `2px solid ${sel ? "#6ED640" : "#1e3858"}`,
                            cursor: "pointer",
                            boxShadow: sel ? "0 0 14px rgba(110,214,64,0.35), 0 0 4px rgba(110,214,64,0.6)" : "none",
                          }}>
                          <PixelAvatar avatarId={def.id} size={112} selected={sel} />
                          <span style={{
                            fontFamily: sel ? PF : "inherit",
                            fontSize: sel ? "6px" : "10px",
                            color: sel ? "#78E04A" : "#64748b",
                            lineHeight: 1.6, textAlign: "center",
                          }}>
                            {def.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedAvatar && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-5 flex items-center gap-4 p-4"
                      style={{ background: "#0d1a2e", border: "2px solid #1e3858" }}>
                      <PixelAvatar avatarId={selectedAvatar.id} size={90} selected />
                      <div>
                        <p style={{ fontFamily: PF, fontSize: "8px", color: "#6ED640", marginBottom: "6px" }}>
                          {selectedAvatar.label}
                        </p>
                        <p className="text-xs" style={{ color: "#64748b", lineHeight: 1.7 }}>
                          Ready to start your adventure?<br />
                          You can change your avatar later.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4" style={{ color: "#F472B6", fontFamily: PF, fontSize: "7px" }}>{error}</p>
          )}

          <div className="flex items-center justify-between mt-8">
            {stepIndex > 0
              ? <button onClick={() => setStep(STEPS[stepIndex - 1])}
                  style={{ fontFamily: PF, fontSize: "8px", color: "#475569", background: "none", border: "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                  ← Back
                </button>
              : <div />
            }
            <button onClick={advance} disabled={!canAdvance || saving}
              className="hover:brightness-110 active:scale-95 transition-all"
              style={{
                ...PIXEL_BTN(
                  canAdvance && !saving ? "#6ED640" : "#1e3858",
                  canAdvance && !saving ? "#3A9018" : "#0f1e36",
                  canAdvance && !saving ? "#1E6010" : "#060c18"
                ),
                color: canAdvance && !saving ? "#0a1a06" : "#334155",
                opacity: saving ? 0.7 : 1,
              }}>
              {saving ? "Saving…" : step === "avatar" ? "Start Journey →" : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6" style={{ fontFamily: PF, fontSize: "7px", color: "#334155" }}>
        +50 XP for completing your profile
      </p>
    </div>
  );
}
