"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProAvatar } from "@/components/community/ProAvatar";
import { MessageDraftModal } from "@/components/community/MessageDraftModal";
import { ProfileSetupPanel } from "@/components/community/ProfileSetupPanel";
import type { Professional, CommunityMessage, CommunityProfile } from "@/types/community";
import type { User } from "@supabase/supabase-js";
import {
  MapPin, Sparkles, Star, Send, Trash2, Copy,
  MessageCircle, Bell, BellOff, Pencil, Bookmark, BookmarkCheck,
} from "lucide-react";

const PF = "'Press Start 2P', monospace";

const LABEL_COLORS: Record<string, { bg: string; color: string }> = {
  "Best Match":           { bg: "#fef08a", color: "#713f12" },
  "High Response Chance": { bg: "#bbf7d0", color: "#14532d" },
  "Strong Fit":           { bg: "#bfdbfe", color: "#1e3a8a" },
  "Good Backup":          { bg: "#1e3858", color: "#94a3b8" },
};

const CARD: React.CSSProperties = {
  background: "#0d1a2e",
  border: "2px solid #1e3858",
  boxShadow: "3px 3px 0 #1e3858",
  padding: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const INPUT: React.CSSProperties = {
  background: "#060c18",
  border: "2px solid #1e3858",
  color: "#e2e8f0",
  padding: "8px 10px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  boxShadow: "2px 2px 0 #1e3858",
};

const BTN: React.CSSProperties = {
  fontFamily: PF,
  fontSize: "9px",
  padding: "10px 16px",
  border: "2px solid #3A9018",
  background: "#6ED640",
  color: "#080e1a",
  cursor: "pointer",
  boxShadow: "0 3px 0 #1E6010",
  whiteSpace: "nowrap",
};

const BTN_SM: React.CSSProperties = {
  fontFamily: PF,
  fontSize: "8px",
  padding: "6px 10px",
  border: "2px solid #1e3858",
  background: "#0d1a2e",
  color: "#6ED640",
  cursor: "pointer",
  boxShadow: "2px 2px 0 #1e3858",
};

const BTN_SM_PRIMARY: React.CSSProperties = {
  ...BTN_SM,
  background: "#6ED640",
  color: "#080e1a",
  border: "2px solid #3A9018",
  boxShadow: "2px 2px 0 #1E6010",
};

const BTN_SM_WARN: React.CSSProperties = {
  ...BTN_SM,
  background: "#FBBF24",
  color: "#080e1a",
  border: "2px solid #b45309",
  boxShadow: "2px 2px 0 #92400e",
};

function statusStyle(s: string): React.CSSProperties {
  if (s === "sent")    return { background: "#6ED640", color: "#080e1a", border: "2px solid #3A9018" };
  if (s === "replied") return { background: "#FBBF24", color: "#080e1a", border: "2px solid #b45309" };
  return { background: "#1e3858", color: "#94a3b8", border: "2px solid #2d4d72" };
}

function followUpDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatFollowUp(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dateStr: string | null): boolean {
  return !!dateStr && new Date(dateStr) <= new Date();
}

type Tab = "search" | "saved" | "messages";

type Stats = { drafts: number; sent: number; replied: number };

export function CommunityHub({ user }: { user: User }) {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("search");
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  // ─ Search state ─
  const [form, setForm] = useState({ role: "", company: "", field: "" });
  const [results, setResults] = useState<Professional[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [target, setTarget] = useState<Professional | null>(null);

  // ─ Saved state ─
  const [savedProIds, setSavedProIds] = useState<Set<string>>(new Set());
  const [savedPros, setSavedPros] = useState<Professional[] | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // ─ Messages state ─
  const [messages, setMessages] = useState<CommunityMessage[] | null>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [editingMessage, setEditingMessage] = useState<CommunityMessage | null>(null);

  // ─ XP toast ─
  const [xpToast, setXpToast] = useState<{ xp: number; label: string } | null>(null);

  // ── Boot ─────────────────────────────────────────────────────
  useEffect(() => {
    void Promise.all([loadProfile(), loadStats(), loadSavedProIds()]);
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, college, major, grad_year")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data as CommunityProfile | null);
  };

  const loadStats = async () => {
    const { data } = await supabase.from("messages").select("status");
    if (!data) return;
    setStats({
      drafts:  data.filter(m => m.status === "draft").length,
      sent:    data.filter(m => m.status === "sent").length,
      replied: data.filter(m => m.status === "replied").length,
    });
  };

  const loadSavedProIds = async () => {
    const { data } = await supabase.from("saved_professionals").select("professional_id");
    if (data) setSavedProIds(new Set(data.map(r => r.professional_id as string)));
  };

  const loadSavedPros = async () => {
    setLoadingSaved(true);
    const { data } = await supabase
      .from("saved_professionals")
      .select("professional_id, professionals(*)")
      .order("created_at", { ascending: false });
    setSavedPros(
      (data ?? []).map(r => r.professionals as unknown as Professional).filter(Boolean)
    );
    setLoadingSaved(false);
  };

  // ── Tab activation ────────────────────────────────────────────
  useEffect(() => {
    if (tab === "messages") void loadMessages();
    if (tab === "saved")    void loadSavedPros();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── XP ───────────────────────────────────────────────────────
  const showXpToast = (xp: number, label: string) => {
    setXpToast({ xp, label });
    setTimeout(() => setXpToast(null), 3000);
  };

  const awardXp = async (event: "message_sent" | "reply_received") => {
    try {
      const res = await fetch("/api/community/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });
      const data = await res.json() as { awardedXp?: number };
      const xp = data.awardedXp ?? 0;
      if (xp > 0) {
        showXpToast(xp, event === "message_sent" ? "Message Sent!" : "Reply Received!");
      }
    } catch { /* non-critical */ }
  };

  // ── Bookmarks ─────────────────────────────────────────────────
  const upsertPro = async (pro: Professional): Promise<string | null> => {
    if (pro.id) return pro.id;
    if (pro.linkedin_url) {
      const { data } = await supabase.from("professionals").select("id").eq("linkedin_url", pro.linkedin_url).maybeSingle();
      if (data) return data.id as string;
    }
    const { data } = await supabase.from("professionals").insert({
      full_name: pro.full_name, role: pro.role, company: pro.company,
      field: pro.field || pro.role, location: pro.location ?? null,
      bio: pro.bio ?? null, linkedin_url: pro.linkedin_url ?? null,
      avatar_seed: pro.avatar_seed ?? null,
    }).select("id").single();
    return data ? (data as { id: string }).id : null;
  };

  const toggleSave = async (pro: Professional) => {
    const proId = pro.id && savedProIds.has(pro.id) ? pro.id : (await upsertPro(pro));
    if (!proId) return;

    if (savedProIds.has(proId)) {
      await supabase.from("saved_professionals").delete().eq("professional_id", proId).eq("user_id", user.id);
      setSavedProIds(prev => { const s = new Set(prev); s.delete(proId); return s; });
      setSavedPros(prev => prev?.filter(p => p.id !== proId) ?? null);
    } else {
      await supabase.from("saved_professionals").insert({ user_id: user.id, professional_id: proId });
      setSavedProIds(prev => new Set([...prev, proId]));
      // Update the pro's id in search results so the icon flips immediately
      setResults(prev => prev?.map(p => p === pro ? { ...p, id: proId } : p) ?? null);
    }
  };

  // ── Messages ──────────────────────────────────────────────────
  const loadMessages = async () => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("messages")
      .select("*, professional:professionals(*)")
      .order("created_at", { ascending: false });
    const msgs = (data ?? []) as CommunityMessage[];
    setMessages(msgs);
    setStats({
      drafts:  msgs.filter(m => m.status === "draft").length,
      sent:    msgs.filter(m => m.status === "sent").length,
      replied: msgs.filter(m => m.status === "replied").length,
    });
    setLoadingMsgs(false);
  };

  const updateMessage = async (
    id: string,
    patch: Partial<CommunityMessage>,
    xpEvent?: "message_sent" | "reply_received",
  ) => {
    await supabase.from("messages").update(patch).eq("id", id);
    if (xpEvent) await awardXp(xpEvent);
    void loadMessages();
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    void loadMessages();
  };

  const setFollowUp = async (id: string, days: number | null) => {
    const follow_up_at = days === null ? null : followUpDaysFromNow(days);
    await supabase.from("messages").update({ follow_up_at }).eq("id", id);
    void loadMessages();
  };

  const closeModal = () => { setTarget(null); setEditingMessage(null); };

  const overdueMessages = messages?.filter(m => m.status === "sent" && isOverdue(m.follow_up_at)) ?? [];

  // ── Pro card (shared between search + saved) ──────────────────
  function ProCard({ pro, idx, showLabel = true }: { pro: Professional; idx: number; showLabel?: boolean }) {
    const isTop = showLabel && ((pro.priority_score ?? 0) >= 13 || idx === 0);
    const labelStyle = LABEL_COLORS[pro.priority_label ?? ""] ?? LABEL_COLORS["Good Backup"];
    const saved = !!(pro.id && savedProIds.has(pro.id));

    return (
      <article style={{ ...CARD, outline: isTop ? "2px solid #FBBF24" : "none", outlineOffset: isTop ? "2px" : "0" }}>
        {showLabel && pro.priority_label && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: PF, fontSize: "8px", background: labelStyle.bg, color: labelStyle.color, padding: "3px 7px", border: "2px solid currentColor" }}>
              {isTop && "★ "}{pro.priority_label}
            </span>
            {pro.priority_score !== undefined && <span style={{ fontSize: "11px", color: "#7a8fa8" }}>{pro.priority_score}pts</span>}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <ProAvatar pro={pro} size={48} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: PF, fontSize: "9px", color: "#e2e8f0", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pro.full_name}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pro.role}</div>
            <div style={{ fontSize: "12px", color: "#7a8fa8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pro.company}</div>
          </div>
          {/* Bookmark toggle */}
          <button
            onClick={() => void toggleSave(pro)}
            title={saved ? "Remove bookmark" : "Bookmark"}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}
          >
            {saved
              ? <BookmarkCheck size={16} style={{ color: "#FBBF24" }} />
              : <Bookmark size={16} style={{ color: "#7a8fa8" }} />}
          </button>
        </div>

        {pro.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#7a8fa8" }}>
            <MapPin size={11} /> {pro.location}
          </div>
        )}

        {pro.bio && (
          <p style={{ fontSize: "12px", color: "#7a8fa8", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {pro.bio}
          </p>
        )}

        {showLabel && pro.priority_reason && (
          <p style={{ fontSize: "11px", color: "#7a8fa8", fontStyle: "italic", borderLeft: "2px solid #1e3858", paddingLeft: "8px" }}>
            {pro.priority_reason}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <span style={{ fontFamily: PF, fontSize: "8px", background: "#1e3858", color: "#6ED640", padding: "3px 7px" }}>{pro.field}</span>
        </div>

        <button style={BTN} onClick={() => setTarget(pro)}>
          <Sparkles size={12} style={{ display: "inline", marginRight: 6 }} />
          Draft message
        </button>
      </article>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", color: "#e2e8f0", position: "relative" }}>

      {/* XP toast */}
      {xpToast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 70,
          background: "#0d1a2e", border: "2px solid #FBBF24",
          padding: "12px 20px", fontFamily: PF, fontSize: "10px",
          color: "#FBBF24", boxShadow: "4px 4px 0 #92400e",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <Star size={14} style={{ fill: "#FBBF24", color: "#FBBF24" }} />
          +{xpToast.xp} XP · {xpToast.label}
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: PF, fontSize: "16px", color: "#6ED640", marginBottom: "8px" }}>Community</h1>
        <p style={{ fontSize: "13px", color: "#7a8fa8" }}>Find industry professionals and draft personalized outreach messages.</p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{
          display: "flex", gap: "0", marginBottom: "20px",
          background: "#060c18", border: "2px solid #1a2744",
          boxShadow: "2px 2px 0 #1a2744",
        }}>
          {[
            { label: "Drafts",  value: stats.drafts,  color: "#94a3b8" },
            { label: "Sent",    value: stats.sent,    color: "#6ED640" },
            { label: "Replies", value: stats.replied, color: "#FBBF24" },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: "12px 16px", textAlign: "center",
              borderRight: i < 2 ? "2px solid #1a2744" : "none",
            }}>
              <div style={{ fontFamily: PF, fontSize: "16px", color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: PF, fontSize: "7px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
          <div style={{ flex: 1, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: PF, fontSize: "16px", color: "#a78bfa", marginBottom: 4 }}>
              {stats.sent * 25 + stats.replied * 75}
            </div>
            <div style={{ fontFamily: PF, fontSize: "7px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>XP Earned</div>
          </div>
        </div>
      )}

      {/* Profile setup */}
      <ProfileSetupPanel user={user} profile={profile} onSaved={(p) => setProfile(p)} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #1a2744", marginBottom: "28px" }}>
        {(["search", "saved", "messages"] as Tab[]).map((t) => {
          const label =
            t === "search"   ? "Find Professionals" :
            t === "saved"    ? `Saved${savedProIds.size > 0 ? ` (${savedProIds.size})` : ""}` :
            "My Messages";
          const badge = t === "messages" && overdueMessages.length > 0;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: tab === t ? PF : "inherit",
                fontSize: tab === t ? "9px" : "14px",
                color: tab === t ? "#e2e8f0" : "#64748b",
                padding: "10px 16px",
                borderBottom: tab === t ? "2px solid #6ED640" : "2px solid transparent",
                marginBottom: "-2px",
              }}
            >
              {label}
              {badge && (
                <span style={{ marginLeft: 6, background: "#FBBF24", color: "#080e1a", fontFamily: PF, fontSize: "7px", padding: "2px 5px" }}>
                  {overdueMessages.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search tab ─────────────────────────────────────────── */}
      {tab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ ...CARD }}>
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "end" }}>
              {(["role", "company", "field"] as const).map((key) => (
                <div key={key}>
                  <label style={{ fontFamily: PF, fontSize: "8px", color: "#6ED640", display: "block", marginBottom: 6, textTransform: "uppercase" }}>{key}</label>
                  <input
                    style={INPUT}
                    placeholder={key === "role" ? "Software Engineer" : key === "company" ? "Google" : "Software Engineering"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && void (async () => { setSearching(true); setResults(null); try { const res = await fetch("/api/community/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: form.role, company: form.company, field: form.field, student: { college: profile?.college, major: profile?.major } }) }); const data = await res.json() as { professionals?: Professional[] }; setResults(data.professionals ?? []); } catch { setResults([]); } finally { setSearching(false); } })()}
                  />
                </div>
              ))}
              <button style={BTN} disabled={searching} onClick={() => void (async () => { setSearching(true); setResults(null); try { const res = await fetch("/api/community/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: form.role, company: form.company, field: form.field, student: { college: profile?.college, major: profile?.major } }) }); const data = await res.json() as { professionals?: Professional[] }; setResults(data.professionals ?? []); } catch { setResults([]); } finally { setSearching(false); } })()}>
                {searching ? "..." : "Search"}
              </button>
            </div>
          </div>

          {searching && <div style={{ fontFamily: PF, fontSize: "9px", color: "#7a8fa8" }}>Searching<span>_</span></div>}

          {results && results.length > 0 && !searching && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: PF, fontSize: "9px", color: "#7a8fa8" }}>
              <Star size={12} style={{ fill: "#FBBF24", color: "#FBBF24" }} />
              Top results ranked by networking value for you
            </div>
          )}

          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {results?.map((pro, idx) => <ProCard key={pro.id || pro.linkedin_url || idx} pro={pro} idx={idx} />)}
          </div>

          {results && results.length === 0 && !searching && (
            <div style={{ ...CARD, textAlign: "center", padding: "48px" }}>
              <div style={{ fontFamily: PF, fontSize: "12px", marginBottom: 8 }}>No matches</div>
              <p style={{ fontSize: "13px", color: "#7a8fa8" }}>Try broader terms or leave fields empty.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Saved tab ──────────────────────────────────────────── */}
      {tab === "saved" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loadingSaved && <div style={{ fontFamily: PF, fontSize: "9px", color: "#7a8fa8" }}>Loading_</div>}

          {!loadingSaved && savedPros && savedPros.length === 0 && (
            <div style={{ ...CARD, textAlign: "center", padding: "48px" }}>
              <div style={{ fontFamily: PF, fontSize: "12px", marginBottom: 8 }}>No saved professionals</div>
              <p style={{ fontSize: "13px", color: "#7a8fa8" }}>
                Bookmark pros from{" "}
                <button onClick={() => setTab("search")} style={{ background: "none", border: "none", color: "#6ED640", cursor: "pointer", fontWeight: "bold" }}>
                  Find Professionals
                </button>{" "}
                to save them here.
              </p>
            </div>
          )}

          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {savedPros?.map((pro, idx) => <ProCard key={pro.id || idx} pro={pro} idx={idx} showLabel={false} />)}
          </div>
        </div>
      )}

      {/* ── Messages tab ───────────────────────────────────────── */}
      {tab === "messages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {overdueMessages.length > 0 && (
            <div style={{ background: "#1c1200", border: "2px solid #FBBF24", boxShadow: "3px 3px 0 #92400e", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Bell size={14} style={{ color: "#FBBF24", flexShrink: 0 }} />
              <span style={{ fontFamily: PF, fontSize: "9px", color: "#FBBF24" }}>
                {overdueMessages.length} follow-up{overdueMessages.length > 1 ? "s" : ""} overdue
              </span>
              <span style={{ fontSize: "12px", color: "#a8895a" }}>
                — {overdueMessages.map(m => m.professional?.full_name ?? "someone").join(", ")}
              </span>
            </div>
          )}

          {loadingMsgs && <div style={{ fontFamily: PF, fontSize: "9px", color: "#7a8fa8" }}>Loading_</div>}

          {messages && messages.length === 0 && (
            <div style={{ ...CARD, textAlign: "center", padding: "48px" }}>
              <p style={{ fontSize: "13px", color: "#7a8fa8" }}>
                Nothing here yet. Head to{" "}
                <button onClick={() => setTab("search")} style={{ background: "none", border: "none", color: "#6ED640", cursor: "pointer", fontWeight: "bold" }}>Find Professionals</button>{" "}
                to start.
              </p>
            </div>
          )}

          {messages?.map((m) => {
            const overdue = isOverdue(m.follow_up_at);
            return (
              <article key={m.id} style={{ ...CARD, outline: overdue ? "2px solid #FBBF24" : "none", outlineOffset: overdue ? "2px" : "0" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  {m.professional && <ProAvatar pro={m.professional} size={48} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: PF, fontSize: "9px", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.professional?.full_name ?? "Unknown"}</div>
                    <div style={{ fontSize: "13px", color: "#94a3b8" }}>{m.professional?.role}</div>
                    <div style={{ fontSize: "12px", color: "#7a8fa8" }}>{m.professional?.company}</div>
                  </div>
                  <span style={{ fontFamily: PF, fontSize: "8px", padding: "3px 8px", ...statusStyle(m.status) }}>{m.status}</span>
                </div>

                {m.subject && <div style={{ fontSize: "14px", fontWeight: "bold", color: "#e2e8f0" }}>{m.subject}</div>}

                <div style={{ fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: 1.6, borderTop: "2px dashed #1e3858", paddingTop: "12px", color: "#94a3b8" }}>
                  {m.body}
                </div>

                {/* Follow-up row — only for sent */}
                {m.status === "sent" && (
                  <div style={{ borderTop: "2px dashed #1e3858", paddingTop: "10px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                    {m.follow_up_at ? (
                      <>
                        <Bell size={11} style={{ color: overdue ? "#FBBF24" : "#7a8fa8" }} />
                        <span style={{ fontFamily: PF, fontSize: "8px", color: overdue ? "#FBBF24" : "#7a8fa8" }}>
                          {overdue ? "Follow up now!" : `Follow up ${formatFollowUp(m.follow_up_at)}`}
                        </span>
                        <button style={overdue ? BTN_SM_WARN : BTN_SM} onClick={() => void setFollowUp(m.id, null)}>
                          <BellOff size={9} style={{ display: "inline", marginRight: 3 }} />Clear
                        </button>
                      </>
                    ) : (
                      <>
                        <Bell size={11} style={{ color: "#7a8fa8" }} />
                        <span style={{ fontFamily: PF, fontSize: "8px", color: "#7a8fa8" }}>Remind in:</span>
                        {[3, 7, 14].map(days => (
                          <button key={days} style={BTN_SM} onClick={() => void setFollowUp(m.id, days)}>{days}d</button>
                        ))}
                      </>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", borderTop: "2px dashed #1e3858", paddingTop: "12px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={BTN_SM} onClick={() => void navigator.clipboard.writeText(m.body)}>
                      <Copy size={10} style={{ display: "inline", marginRight: 4 }} />Copy
                    </button>
                    {m.status === "draft" && (
                      <button style={BTN_SM} onClick={() => setEditingMessage(m)}>
                        <Pencil size={10} style={{ display: "inline", marginRight: 4 }} />Edit
                      </button>
                    )}
                    <button style={BTN_SM} onClick={() => void deleteMessage(m.id)}>
                      <Trash2 size={10} style={{ display: "inline", marginRight: 4 }} />Delete
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {m.status === "draft" && (
                      <button style={BTN_SM_PRIMARY} onClick={() => void updateMessage(m.id, { status: "sent", sent_at: new Date().toISOString() }, "message_sent")}>
                        <Send size={10} style={{ display: "inline", marginRight: 4 }} />Mark sent
                      </button>
                    )}
                    {m.status === "sent" && (
                      <button style={BTN_SM_PRIMARY} onClick={() => void updateMessage(m.id, { status: "replied", replied_at: new Date().toISOString() }, "reply_received")}>
                        <MessageCircle size={10} style={{ display: "inline", marginRight: 4 }} />Got a reply!
                      </button>
                    )}
                    {m.status === "replied" && (
                      <button style={BTN_SM} onClick={() => void updateMessage(m.id, { status: "sent", replied_at: null })}>Undo reply</button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Draft / Edit modal */}
      <MessageDraftModal
        professional={target}
        profile={profile}
        onClose={closeModal}
        onSaved={() => { void loadMessages(); void loadStats(); }}
        editMessage={editingMessage ?? undefined}
      />
    </div>
  );
}
