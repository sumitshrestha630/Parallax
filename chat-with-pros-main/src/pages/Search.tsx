import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchProfessionals } from "@/lib/professionals";
import { PixelAvatar } from "@/components/PixelAvatar";
import { MessageDraftDialog } from "@/components/MessageDraftDialog";
import { useAuth, useProfile } from "@/hooks/useAuth";
import type { Professional } from "@/lib/types";
import { Search as SearchIcon, MapPin, Sparkles, Star } from "lucide-react";

const LABEL_STYLES: Record<string, string> = {
  "Best Match":           "bg-yellow-300 text-yellow-900 border-yellow-600",
  "High Response Chance": "bg-green-300 text-green-900 border-green-600",
  "Strong Fit":           "bg-blue-300 text-blue-900 border-blue-600",
  "Good Backup":          "bg-gray-200 text-gray-700 border-gray-400",
};

const TOP_SCORE_THRESHOLD = 13;

const Search = () => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [form, setForm] = useState({ role: "", company: "", field: "" });
  const [query, setQuery] = useState<typeof form | null>({ role: "", company: "", field: "" });
  const [target, setTarget] = useState<Professional | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["pros", query, profile?.college, profile?.major],
    queryFn: () => searchProfessionals({
      ...query!,
      student: {
        college: profile?.college,
        major: profile?.major,
        grad_year: profile?.grad_year,
      },
    }),
    enabled: !!query,
  });

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="font-pixel text-xl mb-2">Find your people</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Search by role, company, or field. Results are ranked by who to reach out to first.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setQuery({ ...form }); }}
        className="pixel-card p-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
      >
        <Field label="Role" placeholder="Software Engineer" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
        <Field label="Company" placeholder="Google" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
        <Field label="Field" placeholder="Software Engineering" value={form.field} onChange={(v) => setForm({ ...form, field: v })} />
        <Button type="submit" size="lg">
          <SearchIcon className="size-4" /> Search
        </Button>
      </form>

      {isFetching && (
        <div className="font-pixel text-xs text-muted-foreground">
          Loading<span className="animate-blink">_</span>
        </div>
      )}

      {data && data.length > 0 && !isFetching && (
        <div className="font-pixel text-[10px] text-muted-foreground flex items-center gap-2">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
          Top results ranked by networking value for you
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((pro, idx) => {
          const isTop = (pro.priority_score ?? 0) >= TOP_SCORE_THRESHOLD || idx === 0;
          const labelStyle = LABEL_STYLES[pro.priority_label ?? ""] ?? LABEL_STYLES["Good Backup"];

          return (
            <article
              key={pro.id ?? pro.linkedin_url ?? idx}
              className={`pixel-card p-5 flex flex-col gap-4 transition-all ${
                isTop ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background" : ""
              }`}
            >
              {/* Priority label */}
              {pro.priority_label && (
                <div className="flex items-center justify-between">
                  <span className={`pixel-tag border-2 text-[9px] font-pixel ${labelStyle}`}>
                    {isTop && <Star className="inline size-2.5 mr-1 fill-current" />}
                    {pro.priority_label}
                  </span>
                  {pro.priority_score !== undefined && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {pro.priority_score}pts
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-start gap-3">
                <PixelAvatar pro={pro} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-pixel text-xs leading-snug truncate">{pro.full_name}</h3>
                  <p className="font-mono text-sm mt-1 truncate">{pro.role}</p>
                  <p className="font-mono text-xs text-muted-foreground truncate">{pro.company}</p>
                </div>
              </div>

              {pro.location && (
                <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {pro.location}
                </div>
              )}

              {pro.bio && <p className="font-mono text-xs text-muted-foreground line-clamp-3">{pro.bio}</p>}

              {/* Priority reason */}
              {pro.priority_reason && (
                <p className="font-mono text-[10px] text-muted-foreground italic border-l-2 border-border pl-2">
                  {pro.priority_reason}
                </p>
              )}

              <div className="flex items-center gap-2 mt-auto">
                <span className="pixel-tag bg-accent text-accent-foreground">{pro.field}</span>
              </div>

              <Button variant="default" size="sm" onClick={() => setTarget(pro)} className="w-full">
                <Sparkles className="size-4" /> Draft message
              </Button>
            </article>
          );
        })}
      </div>

      {data && data.length === 0 && !isFetching && (
        <div className="pixel-card p-10 text-center">
          <div className="font-pixel text-sm">No matches</div>
          <p className="mt-2 font-mono text-sm text-muted-foreground">Try broader terms or leave fields empty.</p>
        </div>
      )}

      <MessageDraftDialog professional={target} onClose={() => setTarget(null)} />
    </div>
  );
};

const Field = ({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="font-pixel text-[10px]">{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border-2 border-border shadow-pixel-sm font-mono"
    />
  </div>
);

export default Search;
