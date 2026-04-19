"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProAvatar } from "@/components/community/ProAvatar";
import { MessageDraftModal } from "@/components/community/MessageDraftModal";
import type { Professional, CommunityMessage, CommunityProfile } from "@/types/community";
import type { User } from "@supabase/supabase-js";
import { MapPin, Sparkles, Star, Send, Trash2, Copy, MessageCircle } from "lucide-react";

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

function statusStyle(s: string): React.CSSProperties {
  if (s === "sent")    return { background: "#6ED640", color: "#080e1a", border: "2px solid #3A9018" };
  if (s === "replied") return { background: "#FBBF24", color: "#080e1a", border: "2px solid #b45309" };
  return { background: "#1e3858", color: "#94a3b8", border: "2px solid #2d4d72" };
}

type Tab = "search" | "messages";

export function CommunityHub({ user }: { user: User }) {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("search");
  const [profile, setProfile] = useState<CommunityProfile | null>(null);

  // ─ Search state ─
  const [form, setForm] = useState({ role: "", company: "", field: "" });
  const [results, setResults] = useState<Professional[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [target, setTarget] = useState<Professional | null>(null);

  // ─ Messages state ─
  const [messages, setMessages] = useState<CommunityMessage[] | null>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, college, major, grad_year")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as CommunityProfile | null));
  }, [user.id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = async () => {
    setSearching(true);
    setResults(null);
    try {
      const res = await fetch("/api/community/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role, company: form.company, field: form.field,
          student: { college: profile?.college, major: profile?.major },
        }),
      });
      const data = await res.json() as { professionals?: Professional[] };
      setResults(data.professionals ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("messages")
      .select("*, professional:professionals(*)")
      .order("created_at", { ascending: false });
    setMessages((data ?? []) as CommunityMessage[]);
    setLoadingMsgs(false);
  };

  useEffect(() => {
    if (tab === "messages") void loadMessages();
  }, [tab]);  // eslint-disable-line react-hooks/exhaustive-deps

  const updateMessageStatus = async (id: string, patch: Partial<CommunityMessage>) => {
    await supabase.from("messages").update(patch).eq("id", id);
    void loadMessages();
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    void loadMessages();
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", color: "#e2e8f0" }}>
      {/* Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: PF, fontSize: "16px", color: "#6ED640", marginBottom: "8px" }}>Community</h1>
        <p style={{ fontSize: "13px", color: "#7a8fa8" }}>Find industry professionals and draft personalized outreach messages.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #1a2744", marginBottom: "28px" }}>
        {(["search", "messages"] as Tab[]).map((t) => (
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
            {t === "search" ? "Find Professionals" : "My Messages"}
          </button>
        ))}
      </div>

      {/* ── Search tab ─────────────────────────────────────────── */}
      {tab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Search form */}
          <div style={{ ...CARD }}>
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "end" }}>
              {(["role", "company", "field"] as const).map((key) => (
                <div key={key}>
                  <label style={{ fontFamily: PF, fontSize: "8px", color: "#6ED640", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                    {key}
                  </label>
                  <input
                    style={INPUT}
                    placeholder={key === "role" ? "Software Engineer" : key === "company" ? "Google" : "Software Engineering"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && void runSearch()}
                  />
                </div>
              ))}
              <button style={BTN} onClick={() => void runSearch()} disabled={searching}>
                {searching ? "..." : "Search"}
              </button>
            </div>
          </div>

          {searching && (
            <div style={{ fontFamily: PF, fontSize: "9px", color: "#7a8fa8" }}>Searching<span>_</span></div>
          )}

          {results && results.length > 0 && !searching && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: PF, fontSize: "9px", color: "#7a8fa8" }}>
              <Star size={12} style={{ fill: "#FBBF24", color: "#FBBF24" }} />
              Top results ranked by networking value for you
            </div>
          )}

          {/* Results grid */}
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {results?.map((pro, idx) => {
              const isTop = (pro.priority_score ?? 0) >= 13 || idx === 0;
              const labelStyle = LABEL_COLORS[pro.priority_label ?? ""] ?? LABEL_COLORS["Good Backup"];
              return (
                <article
                  key={pro.id || pro.linkedin_url || idx}
                  style={{
                    ...CARD,
                    outline: isTop ? "2px solid #FBBF24" : "none",
                    outlineOffset: isTop ? "2px" : "0",
                  }}
                >
                  {pro.priority_label && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        fontFamily: PF, fontSize: "8px",
                        background: labelStyle.bg, color: labelStyle.color,
                        padding: "3px 7px", border: "2px solid currentColor",
                      }}>
                        {isTop && "★ "}{pro.priority_label}
                      </span>
                      {pro.priority_score !== undefined && (
                        <span style={{ fontSize: "11px", color: "#7a8fa8" }}>{pro.priority_score}pts</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <ProAvatar pro={pro} size={48} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: PF, fontSize: "9px", color: "#e2e8f0", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pro.full_name}</div>
                      <div style={{ fontSize: "13px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pro.role}</div>
                      <div style={{ fontSize: "12px", color: "#7a8fa8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pro.company}</div>
                    </div>
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

                  {pro.priority_reason && (
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
            })}
          </div>

          {results && results.length === 0 && !searching && (
            <div style={{ ...CARD, textAlign: "center", padding: "48px" }}>
              <div style={{ fontFamily: PF, fontSize: "12px", marginBottom: 8 }}>No matches</div>
              <p style={{ fontSize: "13px", color: "#7a8fa8" }}>Try broader terms or leave fields empty.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Messages tab ───────────────────────────────────────── */}
      {tab === "messages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loadingMsgs && <div style={{ fontFamily: PF, fontSize: "9px", color: "#7a8fa8" }}>Loading_</div>}

          {messages && messages.length === 0 && (
            <div style={{ ...CARD, textAlign: "center", padding: "48px" }}>
              <p style={{ fontSize: "13px", color: "#7a8fa8" }}>
                Nothing here yet. Head to{" "}
                <button onClick={() => setTab("search")} style={{ background: "none", border: "none", color: "#6ED640", cursor: "pointer", fontWeight: "bold" }}>
                  Find Professionals
                </button>{" "}
                to start.
              </p>
            </div>
          )}

          {messages?.map((m) => (
            <article key={m.id} style={{ ...CARD }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {m.professional && <ProAvatar pro={m.professional} size={48} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: PF, fontSize: "9px", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.professional?.full_name ?? "Unknown"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>{m.professional?.role}</div>
                  <div style={{ fontSize: "12px", color: "#7a8fa8" }}>{m.professional?.company}</div>
                </div>
                <span style={{
                  fontFamily: PF, fontSize: "8px", padding: "3px 8px",
                  ...statusStyle(m.status),
                }}>
                  {m.status}
                </span>
              </div>

              {m.subject && (
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#e2e8f0" }}>{m.subject}</div>
              )}

              <div style={{
                fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: 1.6,
                borderTop: "2px dashed #1e3858", paddingTop: "12px", color: "#94a3b8",
              }}>
                {m.body}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", borderTop: "2px dashed #1e3858", paddingTop: "12px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={BTN_SM} onClick={() => navigator.clipboard.writeText(m.body)}>
                    <Copy size={10} style={{ display: "inline", marginRight: 4 }} />Copy
                  </button>
                  <button style={BTN_SM} onClick={() => deleteMessage(m.id)}>
                    <Trash2 size={10} style={{ display: "inline", marginRight: 4 }} />Delete
                  </button>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {m.status === "draft" && (
                    <button style={BTN_SM_PRIMARY} onClick={() => updateMessageStatus(m.id, { status: "sent", sent_at: new Date().toISOString() })}>
                      <Send size={10} style={{ display: "inline", marginRight: 4 }} />Mark sent
                    </button>
                  )}
                  {m.status === "sent" && (
                    <button style={BTN_SM_PRIMARY} onClick={() => updateMessageStatus(m.id, { status: "replied", replied_at: new Date().toISOString() })}>
                      <MessageCircle size={10} style={{ display: "inline", marginRight: 4 }} />Got a reply!
                    </button>
                  )}
                  {m.status === "replied" && (
                    <button style={BTN_SM} onClick={() => updateMessageStatus(m.id, { status: "sent", replied_at: null })}>
                      Undo reply
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Draft modal */}
      <MessageDraftModal
        professional={target}
        profile={profile}
        onClose={() => setTarget(null)}
        onSaved={() => { if (tab === "messages") void loadMessages(); }}
      />
    </div>
  );
}
