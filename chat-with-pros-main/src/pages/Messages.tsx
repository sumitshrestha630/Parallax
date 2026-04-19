import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PixelAvatar } from "@/components/PixelAvatar";
import { toast } from "@/hooks/use-toast";
import type { Message, Professional } from "@/lib/types";
import { Send, MessageCircle, Trash2, Copy } from "lucide-react";

type MessageWithPro = Message & { professional: Professional | null };

const Messages = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<MessageWithPro[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, professional:professionals(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MessageWithPro[];
    },
  });

  const updateStatus = async (id: string, patch: Partial<Message>) => {
    const { error } = await supabase.from("messages").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["messages"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["messages"] });
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-pixel text-xl">Outbox</h1>
        <p className="font-mono text-sm text-muted-foreground mt-1">Every message you've drafted, sent, or got a reply on.</p>
      </div>

      {isLoading && <div className="font-pixel text-xs">Loading<span className="animate-blink">_</span></div>}

      {data && data.length === 0 && (
        <div className="pixel-card p-10 text-center font-mono text-sm text-muted-foreground">
          Nothing here yet. Head to <a href="/search" className="underline font-bold">Find</a> to start.
        </div>
      )}

      <div className="space-y-4">
        {data?.map((m) => (
          <article key={m.id} className="pixel-card p-5 space-y-4">
            <div className="flex items-start gap-3">
              {m.professional && <PixelAvatar pro={m.professional} size={48} />}
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-xs truncate">{m.professional?.full_name ?? "Unknown"}</div>
                <div className="font-mono text-sm">{m.professional?.role}</div>
                <div className="font-mono text-xs text-muted-foreground">{m.professional?.company}</div>
              </div>
              <span className={`pixel-tag ${statusTone(m.status)}`}>{m.status}</span>
            </div>

            {m.subject && <div className="font-mono text-sm font-bold">{m.subject}</div>}
            <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed border-t-2 border-dashed border-border pt-3 text-muted-foreground">
              {m.body}
            </div>

            <div className="flex flex-wrap gap-2 justify-between pt-2 border-t-2 border-dashed border-border">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(m.body).then(() => toast({ title: "Copied" }))}
                >
                  <Copy className="size-3" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>
                  <Trash2 className="size-3" /> Delete
                </Button>
              </div>
              <div className="flex gap-2">
                {m.status === "draft" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateStatus(m.id, { status: "sent", sent_at: new Date().toISOString() })}
                  >
                    <Send className="size-3" /> Mark sent
                  </Button>
                )}
                {m.status === "sent" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => updateStatus(m.id, { status: "replied", replied_at: new Date().toISOString() })}
                  >
                    <MessageCircle className="size-3" /> Got a reply!
                  </Button>
                )}
                {m.status === "replied" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(m.id, { status: "sent", replied_at: null })}
                  >
                    Undo reply
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

function statusTone(s: Message["status"]) {
  if (s === "sent") return "bg-primary text-primary-foreground";
  if (s === "replied") return "bg-success text-success-foreground";
  return "bg-muted text-foreground";
}

export default Messages;
