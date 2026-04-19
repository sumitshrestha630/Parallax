import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PixelAvatar } from "@/components/PixelAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { Professional } from "@/lib/types";
import { Sparkles, Send, RotateCw, Copy, Loader2, Linkedin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const MessageDraftDialog = ({
  professional,
  onClose,
}: {
  professional: Professional | null;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variation, setVariation] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (professional) {
      setSubject("");
      setBody("");
      setGoal("");
      setVariation(0);
      void generate(0, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professional?.id]);

  const generate = async (varNum: number, customGoal: string) => {
    if (!professional) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional: {
            full_name: professional.full_name,
            role: professional.role,
            company: professional.company,
            field: professional.field,
            bio: professional.bio,
          },
          student: {
            full_name: profile?.full_name,
            college: profile?.college,
            major: profile?.major,
            grad_year: profile?.grad_year,
          },
          goal: customGoal || "",
          variation: varNum,
        }),
      });
      if (!res.ok) throw new Error(`Draft failed: ${res.status}`);
      const payload = await res.json() as { subject?: string; body?: string; error?: string };
      if (payload.error) throw new Error(payload.error);
      setSubject(payload.subject ?? "");
      setBody(payload.body ?? "");
    } catch (err) {
      toast({
        title: "Couldn't generate",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    const next = variation + 1;
    setVariation(next);
    void generate(next, goal);
  };

  const upsertProfessional = async (): Promise<string | null> => {
    if (professional.id) return professional.id;
    // Check if already saved (by linkedin_url)
    if (professional.linkedin_url) {
      const { data: existing } = await supabase
        .from("professionals")
        .select("id")
        .eq("linkedin_url", professional.linkedin_url)
        .maybeSingle();
      if (existing) return existing.id;
    }
    const { data, error } = await supabase
      .from("professionals")
      .insert({
        full_name: professional.full_name,
        role: professional.role,
        company: professional.company,
        field: professional.field || professional.role,
        location: professional.location ?? null,
        bio: professional.bio ?? null,
        linkedin_url: professional.linkedin_url ?? null,
        avatar_seed: professional.avatar_seed ?? null,
      })
      .select("id")
      .single();
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return null; }
    return data.id;
  };

  const handleSaveDraft = async () => {
    if (!user || !professional || !body.trim()) return;
    setSaving(true);
    const proId = await upsertProfessional();
    if (!proId) { setSaving(false); return; }
    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      professional_id: proId,
      subject: subject || null,
      body,
      status: "draft",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved as draft" });
    qc.invalidateQueries({ queryKey: ["messages"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
    onClose();
  };

  const handleMarkSent = async () => {
    if (!user || !professional || !body.trim()) return;
    setSaving(true);
    const proId = await upsertProfessional();
    if (!proId) { setSaving(false); return; }
    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      professional_id: proId,
      subject: subject || null,
      body,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't mark sent", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Marked as sent ✓", description: "Tracked in your outbox." });
    qc.invalidateQueries({ queryKey: ["messages"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
    onClose();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${subject ? subject + "\n\n" : ""}${body}`);
    toast({ title: "Copied to clipboard" });
  };

  const handleSendOnLinkedIn = async () => {
    await navigator.clipboard.writeText(`${subject ? subject + "\n\n" : ""}${body}`);
    toast({
      title: "Message copied!",
      description: "Paste it into LinkedIn's message box.",
    });
    const url = professional?.linkedin_url ?? "https://www.linkedin.com";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={!!professional} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-2 border-border shadow-pixel-lg bg-card">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm">Draft outreach</DialogTitle>
        </DialogHeader>

        {professional && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-3 border-2 border-border bg-muted">
              <PixelAvatar pro={professional} size={48} />
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-xs">{professional.full_name}</div>
                <div className="font-mono text-sm">{professional.role}</div>
                <div className="font-mono text-xs text-muted-foreground">{professional.company}</div>
              </div>
              {professional.linkedin_url && (
                <a
                  href={professional.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid place-items-center size-10 border-2 border-border bg-card shadow-pixel-sm hover:bg-muted"
                  title="Open LinkedIn"
                >
                  <Linkedin className="size-4" />
                </a>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-pixel text-[10px]">Goal (optional)</Label>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Ask about breaking into ML eng"
                className="border-2 border-border shadow-pixel-sm font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-pixel text-[10px]">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={generating}
                className="border-2 border-border shadow-pixel-sm font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-pixel text-[10px]">Message</Label>
              <Textarea
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={generating}
                className="border-2 border-border shadow-pixel-sm font-mono leading-relaxed"
                placeholder={generating ? "Drafting..." : "Your message"}
              />
              {generating && (
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> AI is drafting
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generating}>
                  <RotateCw className="size-4" /> Regenerate
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!body}>
                  <Copy className="size-4" /> Copy
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={!body || saving}>
                  Save draft
                </Button>
                <Button variant="outline" size="sm" onClick={handleSendOnLinkedIn} disabled={!body || generating}>
                  <Linkedin className="size-4" /> Send on LinkedIn
                </Button>
                <Button variant="success" size="sm" onClick={handleMarkSent} disabled={!body || saving}>
                  <Send className="size-4" /> Mark sent
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
