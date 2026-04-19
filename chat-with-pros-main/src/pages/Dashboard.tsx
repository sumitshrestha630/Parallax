import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PixelAvatar } from "@/components/PixelAvatar";
import { Search, Send, FileEdit, MessageCircle, TrendingUp, Sparkles } from "lucide-react";
import type { Message, Professional } from "@/lib/types";

type MessageWithPro = Message & { professional: Professional | null };

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const { data: messages } = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: async (): Promise<MessageWithPro[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, professional:professionals(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MessageWithPro[];
    },
    enabled: !!user,
  });

  const stats = computeStats(messages ?? []);
  const recent = (messages ?? []).slice(0, 5);

  return (
    <div className="container py-8 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-muted-foreground">
            {greeting()}, {profile?.full_name?.split(" ")[0] || "friend"}
          </div>
          <h1 className="font-pixel text-xl mt-1">Your outreach HQ</h1>
        </div>
        <Link to="/search">
          <Button variant="default">
            <Search className="size-4" /> Find professionals
          </Button>
        </Link>
      </header>

      {!profile?.full_name && (
        <Link to="/profile" className="block">
          <div className="pixel-card p-4 flex items-center justify-between bg-accent">
            <div>
              <div className="font-pixel text-xs">Finish your profile</div>
              <p className="font-mono text-xs text-accent-foreground/80 mt-1">
                AI uses your name, college, and major to personalize messages.
              </p>
            </div>
            <Button variant="outline" size="sm">Complete →</Button>
          </div>
        </Link>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Drafted" value={stats.drafted} icon={FileEdit} tone="bg-secondary text-secondary-foreground" />
        <StatCard label="Sent" value={stats.sent} icon={Send} tone="bg-primary text-primary-foreground" />
        <StatCard label="Replies" value={stats.replied} icon={MessageCircle} tone="bg-success text-success-foreground" />
        <StatCard label="Reply rate" value={`${stats.replyRate}%`} icon={TrendingUp} tone="bg-accent text-accent-foreground" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-sm">Recent activity</h2>
          <Link to="/messages" className="font-mono text-xs underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="pixel-card p-10 text-center">
            <Sparkles className="size-8 mx-auto mb-3 text-muted-foreground" />
            <div className="font-pixel text-xs">No messages yet</div>
            <p className="mt-2 font-mono text-sm text-muted-foreground">Find someone interesting and draft your first one.</p>
            <Link to="/search">
              <Button variant="default" size="sm" className="mt-4">Start searching</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {recent.map((m) => (
              <div key={m.id} className="pixel-card p-4 flex items-center gap-4">
                {m.professional && <PixelAvatar pro={m.professional} size={44} />}
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[11px] truncate">{m.professional?.full_name ?? "Unknown"}</div>
                  <div className="font-mono text-xs text-muted-foreground truncate">
                    {m.professional?.role} · {m.professional?.company}
                  </div>
                </div>
                <span className={`pixel-tag ${statusTone(m.status)}`}>{m.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: typeof Send;
  tone: string;
}) => (
  <div className="pixel-card p-5">
    <div className={`grid size-9 place-items-center border-2 border-border shadow-pixel-sm mb-3 ${tone}`}>
      <Icon className="size-4" />
    </div>
    <div className="font-pixel text-2xl">{value}</div>
    <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
  </div>
);

function statusTone(s: Message["status"]) {
  if (s === "sent") return "bg-primary text-primary-foreground";
  if (s === "replied") return "bg-success text-success-foreground";
  return "bg-muted text-foreground";
}

function computeStats(msgs: MessageWithPro[]) {
  const drafted = msgs.length;
  const sent = msgs.filter((m) => m.status === "sent" || m.status === "replied").length;
  const replied = msgs.filter((m) => m.status === "replied").length;
  const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;
  return { drafted, sent, replied, replyRate };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default Dashboard;
