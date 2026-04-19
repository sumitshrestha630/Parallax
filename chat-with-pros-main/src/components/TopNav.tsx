import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Search, LayoutDashboard, Inbox, User as UserIcon } from "lucide-react";

export const TopNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { to: "/dashboard", label: "Dash", icon: LayoutDashboard },
    { to: "/search", label: "Find", icon: Search },
    { to: "/messages", label: "Outbox", icon: Inbox },
    { to: "/profile", label: "Me", icon: UserIcon },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center border-2 border-border bg-primary text-primary-foreground shadow-pixel-sm">
            <span className="font-pixel text-[10px]">RN</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-pixel text-sm leading-none">RetroNet</div>
            <div className="font-mono text-[10px] text-muted-foreground">cold outreach, warm wins</div>
          </div>
        </Link>

        {user && (
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to}>
                  <Button variant={active ? "default" : "ghost"} size="sm">
                    <Icon className="size-4" />
                    <span className="hidden md:inline">{t.label}</span>
                  </Button>
                </Link>
              );
            })}
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="size-4" />
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};
