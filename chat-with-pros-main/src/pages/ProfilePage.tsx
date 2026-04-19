import { useEffect, useState } from "react";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, refresh } = useProfile(user?.id);
  const [form, setForm] = useState({ full_name: "", college: "", major: "", grad_year: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        college: profile.college ?? "",
        major: profile.major ?? "",
        grad_year: profile.grad_year ?? "",
      });
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = { user_id: user.id, ...form };
    const { error } = profile
      ? await supabase.from("profiles").update(form).eq("user_id", user.id)
      : await supabase.from("profiles").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile saved ✓" });
    refresh();
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="font-pixel text-xl mb-2">Your profile</h1>
      <p className="font-mono text-sm text-muted-foreground mb-6">
        Used to personalize your outreach messages. The AI references this when drafting.
      </p>

      <form onSubmit={save} className="pixel-card p-6 space-y-5">
        <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} placeholder="Sam Rivera" />
        <Field label="College" value={form.college} onChange={(v) => setForm({ ...form, college: v })} placeholder="UC Berkeley" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Major" value={form.major} onChange={(v) => setForm({ ...form, major: v })} placeholder="Computer Science" />
          <Field label="Grad year" value={form.grad_year} onChange={(v) => setForm({ ...form, grad_year: v })} placeholder="2026" />
        </div>
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </form>

      <div className="mt-6 font-mono text-xs text-muted-foreground">
        Signed in as <span className="font-bold text-foreground">{user?.email}</span>
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
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

export default ProfilePage;
