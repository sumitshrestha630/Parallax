import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Send, Trophy } from "lucide-react";

const Landing = () => {
  return (
    <div className="container py-12 md:py-20">
      {/* HERO */}
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 inline-block rotate-[-2deg] bg-accent px-3 py-1 font-pixel text-[10px] shadow-pixel-sm border-2 border-border">
            ◆ FOR COLLEGE STUDENTS
          </div>
          <h1 className="font-pixel text-3xl leading-tight md:text-5xl">
            Cold outreach,<br />
            <span className="bg-primary text-primary-foreground px-2 inline-block mt-2 border-2 border-border shadow-pixel">
              warm wins.
            </span>
          </h1>
          <p className="mt-6 max-w-md font-mono text-base text-muted-foreground">
            Find real professionals in any role, company, or field. Get an
            AI-written cold message in seconds. Track every reply.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth"><Button size="lg" variant="default">Start networking →</Button></Link>
            <Link to="/auth"><Button size="lg" variant="outline">See it in action</Button></Link>
          </div>
          <div className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="size-2 bg-success animate-pulse" />
            Free during beta · No credit card
          </div>
        </div>

        {/* Mock card */}
        <div className="relative">
          <div className="absolute -left-4 -top-4 rotate-[-4deg] bg-secondary px-3 py-1 font-pixel text-[10px] text-secondary-foreground shadow-pixel-sm border-2 border-border z-10">
            DRAFT 1.0
          </div>
          <div className="pixel-card-lg p-6 space-y-4 rotate-1">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center bg-primary text-primary-foreground border-2 border-border shadow-pixel-sm font-pixel text-xs">
                MC
              </div>
              <div>
                <div className="font-pixel text-xs">Maya Chen</div>
                <div className="font-mono text-xs text-muted-foreground">SWE · Google</div>
              </div>
            </div>
            <div className="border-t-2 border-dashed border-border pt-3 font-mono text-sm leading-relaxed">
              <p className="font-bold mb-2">Berkeley CS grad → SWE at Google?</p>
              <p className="text-muted-foreground">
                Hi Maya, I'm Sam, a junior at Cal studying CS. Your work on Search infra
                is exactly the kind of systems work I want to do after graduation. Could
                I steal 15 minutes to ask how you broke into the team?
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="success" size="sm" className="flex-1">
                <Send className="size-3" /> Mark sent
              </Button>
              <Button variant="outline" size="sm">
                <Sparkles className="size-3" /> Regen
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="mt-24">
        <h2 className="font-pixel text-xl mb-10 text-center">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Search, title: "1. Search", body: "Pick a role, company, and field. We surface matching professionals." },
            { icon: Sparkles, title: "2. Generate", body: "AI writes a short, specific message tuned to your background." },
            { icon: Trophy, title: "3. Track", body: "Mark messages sent and watch your reply rate climb." },
          ].map((s) => (
            <div key={s.title} className="pixel-card p-6">
              <div className="grid size-10 place-items-center border-2 border-border bg-accent shadow-pixel-sm mb-4">
                <s.icon className="size-5 text-accent-foreground" />
              </div>
              <h3 className="font-pixel text-sm mb-2">{s.title}</h3>
              <p className="font-mono text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
