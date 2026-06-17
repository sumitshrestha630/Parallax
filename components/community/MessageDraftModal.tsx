"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProAvatar } from "@/components/community/ProAvatar";
import type { Professional, CommunityProfile, CommunityMessage } from "@/types/community";

const PF = "'Press Start 2P', monospace";

const BTN: React.CSSProperties = {
  fontFamily: PF,
  fontSize: "9px",
  padding: "8px 14px",
  border: "2px solid #1e3858",
  background: "#0d1a2e",
  color: "#6ED640",
  cursor: "pointer",
  boxShadow: "2px 2px 0 #1e3858",
};

const BTN_PRIMARY: React.CSSProperties = {
  ...BTN,
  background: "#6ED640",
  color: "#080e1a",
  border: "2px solid #3A9018",
  boxShadow: "2px 2px 0 #1E6010",
};

export function MessageDraftModal({
  professional,
  profile,
  onClose,
  onSaved,
  editMessage,
}: {
  professional: Professional | null;
  profile: CommunityProfile | null;
  onClose: () => void;
  onSaved: () => void;
  editMessage?: CommunityMessage;
}) {
  const supabase = createClient();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [goal, setGoal] = useState("");
  const [variation, setVariation] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const isEditMode = !!editMessage;
  const activePro = professional ?? editMessage?.professional ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (editMessage) {
      // Edit mode: pre-fill, no auto-generation
      setSubject(editMessage.subject ?? "");
      setBody(editMessage.body);
      setGoal("");
      setVariation(0);
    } else if (professional) {
      // New draft: auto-generate
      setSubject(""); setBody(""); setGoal(""); setVariation(0);
      void generate(0, "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professional?.id, professional?.linkedin_url, editMessage?.id]);

  const generate = async (varNum: number, customGoal: string) => {
    if (!activePro) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/community/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional: {
            full_name: activePro.full_name,
            role: activePro.role,
            company: activePro.company,
            field: activePro.field,
            bio: activePro.bio,
          },
          student: {
            full_name: profile?.full_name,
            college: profile?.college,
            major: profile?.major,
            grad_year: profile?.grad_year,
          },
          goal: customGoal,
          variation: varNum,
        }),
      });
      const data = await res.json() as { subject?: string; body?: string; error?: string };
      if (data.error) throw new Error(data.error);
      setSubject(data.subject ?? "");
      setBody(data.body ?? "");
    } catch {
      showToast("Couldn't generate — try again");
    } finally {
      setGenerating(false);
    }
  };

  const upsertProfessional = async (): Promise<string | null> => {
    if (!activePro) return null;
    if (activePro.id) return activePro.id;

    if (activePro.linkedin_url) {
      const { data: existing } = await supabase
        .from("professionals")
        .select("id")
        .eq("linkedin_url", activePro.linkedin_url)
        .maybeSingle();
      if (existing) return existing.id as string;
    }

    const { data, error } = await supabase
      .from("professionals")
      .insert({
        full_name: activePro.full_name,
        role: activePro.role,
        company: activePro.company,
        field: activePro.field || activePro.role,
        location: activePro.location ?? null,
        bio: activePro.bio ?? null,
        linkedin_url: activePro.linkedin_url ?? null,
        avatar_seed: activePro.avatar_seed ?? null,
      })
      .select("id")
      .single();
    if (error) { showToast("Save failed: " + error.message); return null; }
    return (data as { id: string }).id;
  };

  const awardXp = async (event: string): Promise<number> => {
    try {
      const res = await fetch("/api/community/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });
      const data = await res.json() as { awardedXp?: number };
      return data.awardedXp ?? 0;
    } catch {
      return 0;
    }
  };

  const saveMessage = async (status: "draft" | "sent") => {
    if (!body.trim()) return;
    setSaving(true);

    if (isEditMode) {
      const { error } = await supabase
        .from("messages")
        .update({
          subject: subject || null,
          body,
          status,
          ...(status === "sent" ? { sent_at: new Date().toISOString() } : {}),
        })
        .eq("id", editMessage.id);
      setSaving(false);
      if (error) { showToast("Save failed: " + error.message); return; }
      if (status === "sent") {
        const xp = await awardXp("message_sent");
        showToast(`Marked as sent ✓  ·  +${xp} XP`);
      } else {
        showToast("Draft updated");
      }
      onSaved();
      onClose();
      return;
    }

    const proId = await upsertProfessional();
    if (!proId) { setSaving(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      professional_id: proId,
      subject: subject || null,
      body,
      status,
      ...(status === "sent" ? { sent_at: new Date().toISOString() } : {}),
    });
    setSaving(false);
    if (error) { showToast("Save failed: " + error.message); return; }
    if (status === "sent") {
      const xp = await awardXp("message_sent");
      showToast(`Marked as sent ✓  ·  +${xp} XP`);
    } else {
      showToast("Saved as draft");
    }
    onSaved();
    onClose();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`${subject ? subject + "\n\n" : ""}${body}`);
    showToast("Copied!");
  };

  const sendOnLinkedIn = async () => {
    await copy();
    window.open(activePro?.linkedin_url ?? "https://www.linkedin.com", "_blank", "noopener,noreferrer");
  };

  if (!activePro) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(8,14,26,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          background: "#0d1a2e", border: "2px solid #6ED640", padding: "10px 20px",
          fontFamily: PF, fontSize: "9px", color: "#6ED640", zIndex: 60,
          boxShadow: "4px 4px 0 #1E6010",
        }}>
          {toast}
        </div>
      )}

      <div style={{
        background: "#060c18",
        border: "2px solid #1e3858",
        boxShadow: "4px 4px 0 #1e3858",
        width: "100%",
        maxWidth: 600,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: PF, fontSize: "11px", color: "#6ED640" }}>
            {isEditMode ? "Edit draft" : "Draft outreach"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7a8fa8", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>

        {/* Pro header */}
        <div style={{
          display: "flex", gap: "12px", padding: "12px",
          border: "2px solid #1e3858", background: "#0d1a2e",
          alignItems: "flex-start",
        }}>
          <ProAvatar pro={activePro} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: PF, fontSize: "10px", color: "#e2e8f0", marginBottom: 4 }}>{activePro.full_name}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>{activePro.role}</div>
            <div style={{ fontSize: "12px", color: "#7a8fa8" }}>{activePro.company}</div>
          </div>
          {activePro.linkedin_url && (
            <a
              href={activePro.linkedin_url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#6ED640", fontSize: "12px", textDecoration: "none", border: "1px solid #1e3858", padding: "4px 8px" }}
            >
              in
            </a>
          )}
        </div>

        {/* Goal */}
        <div>
          <label style={{ fontFamily: PF, fontSize: "9px", color: "#6ED640", display: "block", marginBottom: 6 }}>Goal (optional)</label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Ask about breaking into ML eng"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#0d1a2e", border: "2px solid #1e3858",
              color: "#e2e8f0", padding: "8px 10px", fontSize: "13px",
              outline: "none", boxShadow: "2px 2px 0 #1e3858",
            }}
          />
        </div>

        {/* Subject */}
        <div>
          <label style={{ fontFamily: PF, fontSize: "9px", color: "#6ED640", display: "block", marginBottom: 6 }}>Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={generating}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#0d1a2e", border: "2px solid #1e3858",
              color: "#e2e8f0", padding: "8px 10px", fontSize: "13px",
              outline: "none", boxShadow: "2px 2px 0 #1e3858",
              opacity: generating ? 0.6 : 1,
            }}
          />
        </div>

        {/* Body */}
        <div>
          <label style={{ fontFamily: PF, fontSize: "9px", color: "#6ED640", display: "block", marginBottom: 6 }}>Message</label>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={generating}
            placeholder={generating ? "Drafting..." : "Your message"}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#0d1a2e", border: "2px solid #1e3858",
              color: "#e2e8f0", padding: "8px 10px", fontSize: "13px",
              lineHeight: 1.6, resize: "vertical", outline: "none",
              boxShadow: "2px 2px 0 #1e3858",
              opacity: generating ? 0.6 : 1,
            }}
          />
          {generating && (
            <div style={{ fontFamily: PF, fontSize: "9px", color: "#7a8fa8", marginTop: 4 }}>
              ✦ AI is drafting<span style={{ animation: "blink 1s step-end infinite" }}>_</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={BTN} disabled={generating} onClick={() => { const n = variation + 1; setVariation(n); void generate(n, goal); }}>
              ↻ Regenerate
            </button>
            <button style={BTN} disabled={!body} onClick={copy}>Copy</button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={BTN} disabled={!body || saving} onClick={() => saveMessage("draft")}>
              {isEditMode ? "Update draft" : "Save draft"}
            </button>
            <button style={BTN} disabled={!body || generating} onClick={sendOnLinkedIn}>↗ LinkedIn</button>
            <button style={BTN_PRIMARY} disabled={!body || saving} onClick={() => saveMessage("sent")}>✓ Mark sent</button>
          </div>
        </div>
      </div>
    </div>
  );
}
