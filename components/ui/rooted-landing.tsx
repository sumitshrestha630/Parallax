"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FeatureGrid, type Feature } from "@/components/ui/feature-grid";

// ─── Shared ───────────────────────────────────────────────────────────────────

const PX = ({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) => (
  <span
    className={className}
    style={{ fontFamily: "'Press Start 2P', monospace", ...style }}
  >
    {children}
  </span>
);

const PIXEL_BTN =
  "inline-block font-bold text-stone-900 transition-all hover:brightness-110 active:scale-95 cursor-pointer";
const PIXEL_BTN_STYLE = (bg = "#6ED640", border = "#3A9018", shadow = "#1E6010"): React.CSSProperties => ({
  fontFamily: "'Press Start 2P', monospace",
  fontSize: "10px",
  background: bg,
  border: `3px solid ${border}`,
  boxShadow: `0 5px 0 ${shadow}, 0 7px 0 rgba(0,0,0,0.4)`,
  padding: "12px 24px",
});

// ─── Nav (fixed — stays on top during scroll) ─────────────────────────────────
const Nav = () => (
  <motion.nav initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, transition: { delay: .15, duration: .6 } }}
    className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(4,9,24,0.92)", backdropFilter: "blur(8px)" }}>
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">🌱</span>
        <PX className="text-white" style={{ fontSize: "12px" }}>ROOTED</PX>
      </div>
      <nav className="hidden md:flex items-center gap-7 text-sm text-stone-300 font-medium">
        {["Learn", "Skill Trees", "Community", "Pricing"].map(l => (
          <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
        ))}
      </nav>
      <Link href="/signup" className={PIXEL_BTN} style={PIXEL_BTN_STYLE()}>Sign up</Link>
    </div>
  </motion.nav>
);

// ─── SECTION 2 — Stats ticker ─────────────────────────────────────────────────
const ticks = [
  "🎮 500+ Students", "📚 50+ Skill Paths", "⚡ Level up in 4 weeks",
  "🆓 Free to start", "🌱 Build real skills", "🏆 Earn XP every day",
  "🎯 Goal-first learning", "🤝 Join the community",
];

const StatsTicker = () => (
  <div className="overflow-hidden py-3 border-y-4 border-[#3A9018]" style={{ background: "#6ED640" }}>
    <div className="flex animate-marquee whitespace-nowrap">
      {[...ticks, ...ticks].map((t, i) => (
        <span key={i} className="mx-10 text-stone-900" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "13px" }}>
          {t}
        </span>
      ))}
    </div>
  </div>
);

// ─── SECTION 3 — Skill paths ──────────────────────────────────────────────────
const pathFeatures: Feature[] = [
  {
    pixelScene: "code",
    imageAlt: "Software Engineering",
    label: "PATH",
    title: "Software Engineer",
    description: "42 skills · 4,200 XP — Python, DSA, System Design, Git. Build production-ready engineering skills from the ground up.",
    href: "#",
    badge: "Intermediate",
  },
  {
    pixelScene: "data",
    imageAlt: "Data Science",
    label: "PATH",
    title: "Data Scientist",
    description: "38 skills · 3,800 XP — Python, SQL, ML, Stats. Learn to extract insights and build models that drive decisions.",
    href: "#",
    badge: "Intermediate",
  },
  {
    pixelScene: "design",
    imageAlt: "UX Design",
    label: "PATH",
    title: "UX Designer",
    description: "30 skills · 3,000 XP — Figma, Research, Prototyping. Design experiences that delight users and solve real problems.",
    href: "#",
    badge: "Beginner",
  },
  {
    pixelScene: "product",
    imageAlt: "Product Management",
    label: "PATH",
    title: "Product Manager",
    description: "35 skills · 3,500 XP — Strategy, Roadmaps, Data, Metrics. Ship products users love and stakeholders trust.",
    href: "#",
    badge: "Beginner",
  },
  {
    pixelScene: "security",
    imageAlt: "Cybersecurity",
    label: "PATH",
    title: "Cybersecurity",
    description: "40 skills · 4,000 XP — Linux, Networking, CTF, Python. Defend systems and think like an attacker.",
    href: "#",
    badge: "Advanced",
  },
  {
    pixelScene: "cloud",
    imageAlt: "Cloud Engineering",
    label: "PATH",
    title: "Cloud Engineer",
    description: "36 skills · 3,600 XP — AWS, Docker, Terraform, CI/CD. Build and scale infrastructure that never sleeps.",
    href: "#",
    badge: "Intermediate",
    isNew: true,
  },
];

const PathsSection = () => (
  <section className="bg-[#060c18] px-6 py-20 border-t border-stone-800">
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#6ED640] mb-3 tracking-widest uppercase" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "13px" }}>
            ▸ Pick Your Path
          </p>
          <h2 className="mb-6" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "18px", lineHeight: 1.7, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
            What do you want<br />to become?
          </h2>
        </div>
        <button className={PIXEL_BTN} style={PIXEL_BTN_STYLE("#6ED640", "#3A9018", "#1E6010")}>
          View all paths →
        </button>
      </div>
      <FeatureGrid features={pathFeatures} />
    </div>
  </section>
);

// ─── SECTION 4 — How It Works ─────────────────────────────────────────────────
const howItWorksFeatures: Feature[] = [
  {
    pixelScene: "goal",
    imageAlt: "Set your goal",
    label: "STEP 01",
    title: "Set Your Goal",
    description: "Tell Rooted what you want to become. We build your personalized skill tree from the ground up.",
    href: "#",
    badge: "Start here",
  },
  {
    pixelScene: "tree",
    imageAlt: "Grow your tree",
    label: "STEP 02",
    title: "Grow Your Tree",
    description: "Complete structured modules. Each skill you unlock opens new branches on your tree.",
    href: "#",
    badge: "Then this",
  },
  {
    pixelScene: "levelup",
    imageAlt: "Level up",
    label: "STEP 03",
    title: "Level Up",
    description: "Earn XP, hit milestones, and watch your character grow — while your real skills do too.",
    href: "#",
    badge: "Then profit",
  },
];

const HowItWorks = () => (
  <section className="bg-[#080e1a] px-6 py-20 border-t border-stone-800">
    <div className="mx-auto max-w-5xl">
      <div className="text-center mb-14">
        <p className="text-[#6ED640] mb-3 tracking-widest uppercase" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "13px" }}>
          ▸ How It Works
        </p>
        <h2 className="mb-6" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "16px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
          Three steps to your future
        </h2>
      </div>
      <FeatureGrid features={howItWorksFeatures} />
    </div>
  </section>
);

// ─── SECTION 5 — Skill Tree visualiser ────────────────────────────────────────
const treeNodes = [
  // root
  { id: "root", label: "You", x: 50, y: 88, color: "#6ED640", size: 16, level: 0 },
  // tier 1
  { id: "python", label: "Python", x: 25, y: 72, color: "#60A5FA", size: 13, level: 1 },
  { id: "dsa", label: "DSA", x: 50, y: 68, color: "#FBBF24", size: 13, level: 1 },
  { id: "git", label: "Git", x: 75, y: 72, color: "#F472B6", size: 13, level: 1 },
  // tier 2
  { id: "oop", label: "OOP", x: 15, y: 52, color: "#60A5FA", size: 11, level: 2 },
  { id: "api", label: "APIs", x: 35, y: 50, color: "#60A5FA", size: 11, level: 2 },
  { id: "trees", label: "Trees", x: 55, y: 48, color: "#FBBF24", size: 11, level: 2 },
  { id: "graphs", label: "Graphs", x: 72, y: 54, color: "#FBBF24", size: 11, level: 2 },
  { id: "ci", label: "CI/CD", x: 85, y: 52, color: "#F472B6", size: 11, level: 2 },
  // tier 3
  { id: "backend", label: "Backend", x: 20, y: 30, color: "#4ADE80", size: 12, level: 3 },
  { id: "system", label: "System\nDesign", x: 45, y: 26, color: "#4ADE80", size: 12, level: 3 },
  { id: "devops", label: "DevOps", x: 78, y: 30, color: "#4ADE80", size: 12, level: 3 },
];

const edges = [
  ["root", "python"], ["root", "dsa"], ["root", "git"],
  ["python", "oop"], ["python", "api"], ["dsa", "trees"], ["dsa", "graphs"], ["git", "ci"],
  ["oop", "backend"], ["api", "backend"], ["trees", "system"], ["graphs", "system"], ["ci", "devops"],
];

const TreeViz = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#040912] px-6 py-20 border-t border-stone-800">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: .7 }}>
            <p className="text-[#6ED640] mb-3 tracking-widest uppercase"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "13px" }}>▸ Skill Tree</p>
            <h2 className="mb-6" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "15px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
              See every skill.<br />Know exactly<br />what&apos;s next.
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-md">
              No more wondering what to learn. Your skill tree lays out the exact path from
              where you are today to where you want to be — with every dependency mapped out.
            </p>
            <div className="flex flex-col gap-3">
              {[["🔓", "Unlock skills in order — no confusion"],
              ["📍", "See exactly where you are on the path"],
              ["🔗", "Understand how skills connect"]].map(([e, t]) => (
                <div key={t as string} className="flex items-start gap-3">
                  <span className="text-lg">{e}</span>
                  <span className="text-stone-300 text-sm">{t as string}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SVG tree */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: .7, delay: .2 }}
            className="relative rounded-xl border border-stone-800 overflow-hidden"
            style={{ background: "#060c18", aspectRatio: "4/3" }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* edges */}
              {edges.map(([a, b]) => {
                const na = treeNodes.find(n => n.id === a)!;
                const nb = treeNodes.find(n => n.id === b)!;
                return (
                  <motion.line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke="#3A6A3A" strokeWidth="0.6"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: .4 }} />
                );
              })}
              {/* nodes */}
              {treeNodes.map((n, i) => (
                <motion.g key={n.id} initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: .3 + i * .06, duration: .4 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx={n.x} cy={n.y} r={n.size * 0.32} fill={`${n.color}22`} />
                  <circle cx={n.x} cy={n.y} r={n.size * 0.22} fill={n.color} />
                  {n.label.split("\n").map((ln, li) => (
                    <text key={li} x={n.x} y={n.y + 3.5 + n.size * 0.36 + li * 2.4}
                      textAnchor="middle" fill="#A8C8A8" fontSize="2.2"
                      style={{ fontFamily: "'Press Start 2P',monospace" }}>
                      {ln}
                    </text>
                  ))}
                </motion.g>
              ))}
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── SECTION 6 — XP & Gamification ───────────────────────────────────────────
const XpBar = ({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between mb-1.5">
        <span className="text-stone-300 text-xs">{label}</span>
        <span className="text-xs" style={{ color, fontFamily: "'Press Start 2P',monospace", fontSize: "12px" }}>{pct}%</span>
      </div>
      <div className="h-3 w-full rounded-none" style={{ background: "#162238", border: "1px solid #1e3858" }}>
        <motion.div className="h-full" style={{ background: color }}
          initial={{ width: 0 }} animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.4, delay, ease: "easeOut" }} />
      </div>
    </div>
  );
};

const badges = [
  { emoji: "🌱", label: "First Commit", color: "#6ED640" },
  { emoji: "🔥", label: "7-Day Streak", color: "#F97316" },
  { emoji: "⚡", label: "Level 5", color: "#FBBF24" },
  { emoji: "🏆", label: "Path Complete", color: "#A78BFA" },
  { emoji: "🤝", label: "Helper", color: "#60A5FA" },
  { emoji: "🎯", label: "Goal Setter", color: "#F472B6" },
];

const GamificationSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section ref={ref} className="bg-[#080e1a] px-6 py-20 border-t border-stone-800">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* XP / Level card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .7 }}>
            <p className="text-[#6ED640] mb-3 tracking-widest uppercase"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "13px" }}>▸ Leveling System</p>
            <h2 className="mb-8" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "15px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
              Every skill earns<br />you XP.
            </h2>
            {/* Player card */}
            <div className="rounded-none border-2 border-stone-700 p-5 mb-6" style={{ background: "#0d1a2e" }}>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center text-2xl border-2 border-[#6ED640]"
                  style={{ background: "#122040" }}>🧑‍💻</div>
                <div>
                  <p className="text-white font-bold text-sm">alex_dev</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#FBBF24]" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "10px" }}>
                      LVL 12
                    </span>
                    <span className="text-stone-500 text-xs">Software Engineer Path</span>
                  </div>
                </div>
              </div>
              <XpBar label="Python Fundamentals" pct={92} color="#60A5FA" delay={.3} />
              <XpBar label="Data Structures" pct={67} color="#FBBF24" delay={.5} />
              <XpBar label="System Design" pct={34} color="#4ADE80" delay={.7} />
              <div className="mt-4 flex items-center justify-between rounded border border-[#3A9018] px-3 py-2"
                style={{ background: "#122040" }}>
                <span className="text-stone-300 text-xs">Total XP</span>
                <PX className="text-[#6ED640]" style={{ fontSize: "12px" }}>11,840 XP</PX>
              </div>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .7, delay: .2 }}>
            <p className="text-[#6ED640] mb-3 tracking-widest uppercase"
              style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "13px" }}>▸ Achievements</p>
            <h2 className="mb-8" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "15px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
              Earn badges.<br />Build your story.
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b, i) => (
                <motion.div key={b.label} initial={{ opacity: 0, scale: .8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: .3 + i * .08, duration: .4 }}
                  className="flex flex-col items-center gap-2 p-4 border-2 cursor-pointer
                    hover:-translate-y-1 transition-transform"
                  style={{ background: "#0d1a2e", borderColor: b.color + "44" }}>
                  <span className="text-2xl animate-float" style={{ animationDelay: `${i * .4}s` }}>{b.emoji}</span>
                  <span className="text-center" style={{
                    color: b.color, fontFamily: "'Press Start 2P',monospace",
                    fontSize: "11px", lineHeight: 1.7
                  }}>
                    {b.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── SECTION 7 — Balance system ───────────────────────────────────────────────
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const schedule = [
  { school: 3, work: 0, skills: 2 },
  { school: 4, work: 3, skills: 1 },
  { school: 2, work: 4, skills: 2 },
  { school: 3, work: 0, skills: 3 },
  { school: 2, work: 4, skills: 2 },
  { school: 0, work: 2, skills: 4 },
  { school: 0, work: 0, skills: 5 },
];

const BalanceSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const total = 8;
  return (
    <section ref={ref} className="bg-[#040912] px-6 py-20 border-t border-stone-800">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <p className="text-[#6ED640] mb-3 tracking-widest uppercase"
            style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "13px" }}>▸ Balance System</p>
          <h2 className="mb-4" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "16px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
            School. Work. Skills.<br />All in balance.
          </h2>
          <p className="text-stone-400 text-sm max-w-xl mx-auto leading-relaxed">
            Rooted looks at your schedule and finds the gaps — so you never feel guilty
            about not studying, and never burn out from overdoing it.
          </p>
        </div>
        {/* Weekly schedule viz */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .7 }}
          className="rounded-none border-2 border-stone-700 p-6" style={{ background: "#060c18" }}>
          <div className="flex items-center justify-between mb-6">
            <PX className="text-white" style={{ fontSize: "10px" }}>This Week</PX>
            <div className="flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 inline-block" style={{ background: "#60A5FA" }} />School</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 inline-block" style={{ background: "#F97316" }} />Work</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 inline-block" style={{ background: "#6ED640" }} />Skills</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-stone-500 text-xs mb-1">{d}</span>
                <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "120px" }}>
                  {[
                    { h: schedule[i].skills / total * 100, c: "#6ED640" },
                    { h: schedule[i].work / total * 100, c: "#F97316" },
                    { h: schedule[i].school / total * 100, c: "#60A5FA" },
                  ].map((bar, j) => (
                    <motion.div key={j} className="w-full rounded-none" style={{ background: bar.c }}
                      initial={{ height: 0 }} animate={inView ? { height: `${bar.h}%` } : {}}
                      transition={{ duration: .9, delay: .3 + i * .06 + j * .05, ease: "easeOut" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── SECTION 8 — Social proof ─────────────────────────────────────────────────
const testimonialFeatures: Feature[] = [
  {
    pixelScene: "student1",
    imageAlt: "Priya S.",
    label: "STUDENT",
    title: "Priya S. — UC Berkeley '27",
    description: "\"I finally know what to learn next. Rooted turned my vague 'become a SWE' goal into a real, trackable plan.\"",
    href: "#",
    badge: "Software Engineer Path",
  },
  {
    pixelScene: "student2",
    imageAlt: "Marcus T.",
    label: "STUDENT",
    title: "Marcus T. — Georgia Tech '26",
    description: "\"The balance system is a game-changer. I fit 2 hours of skill-building into my week without sacrificing GPA.\"",
    href: "#",
    badge: "Data Scientist Path",
  },
  {
    pixelScene: "student3",
    imageAlt: "Leila K.",
    label: "STUDENT",
    title: "Leila K. — NYU '28",
    description: "\"As a freshman I had no idea where to start with UX. Rooted's skill tree made it feel totally achievable.\"",
    href: "#",
    badge: "UX Designer Path",
  },
];

const SocialProof = () => (
  <section className="bg-[#080e1a] px-6 py-20 border-t border-stone-800">
    <div className="mx-auto max-w-5xl">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center">
        {[["500+", "Students"], ["50+", "Skill Paths"], ["98%", "Say it helped"], ["4 wks", "To first level-up"]].map(([n, l]) => (
          <div key={l}>
            <PX className="text-[#6ED640] block mb-1" style={{ fontSize: "18px" }}>{n}</PX>
            <span className="text-stone-400 text-xs">{l}</span>
          </div>
        ))}
      </div>
      {/* Testimonials */}
      <FeatureGrid features={testimonialFeatures} />
    </div>
  </section>
);

// ─── SECTION 9 — Final CTA ────────────────────────────────────────────────────
const FinalCta = () => (
  <section className="px-6 py-24 text-center border-t border-stone-800" style={{ background: "#040912" }}>
    <div className="mx-auto max-w-2xl">
      <div className="text-5xl mb-6 animate-float">🌱</div>
      <h2 className="mb-5" style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "18px", lineHeight: 1.8, color: "#78E04A", textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808" }}>
        Ready to plant<br />your roots?
      </h2>
      <p className="text-stone-400 text-sm leading-relaxed mb-10 max-w-md mx-auto">
        Join 500+ college students who are building real career skills —
        one level at a time. Free to start. Always.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/signup" className={PIXEL_BTN} style={PIXEL_BTN_STYLE()}>
          Start for Free →
        </Link>
        <button className={PIXEL_BTN}
          style={{ ...PIXEL_BTN_STYLE("#122040", "#1e3a6a", "#06111e"), color: "#6ED640" }}>
          Explore Skill Trees
        </button>
      </div>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="border-t border-stone-800 px-6 py-12" style={{ background: "#02060f" }}>
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">🌱</span>
            <PX className="text-white" style={{ fontSize: "13px" }}>ROOTED</PX>
          </div>
          <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
            A gamified skill-building platform for college freshmen who know what they want to become.
          </p>
        </div>
        {/* Links */}
        {[
          { heading: "Product", links: ["Skill Trees", "How it works", "Pricing", "Changelog"] },
          { heading: "Community", links: ["Discord", "Blog", "Events", "Showcase"] },
          { heading: "Company", links: ["About", "Careers", "Press", "Contact"] },
        ].map(col => (
          <div key={col.heading}>
            <PX className="text-stone-500 block mb-4" style={{ fontSize: "12px" }}>{col.heading}</PX>
            <ul className="space-y-2.5">
              {col.links.map(l => (
                <li key={l}><a href="#" className="text-stone-400 text-xs hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-stone-600 text-xs">© 2025 Rooted. All rights reserved.</p>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Cookies"].map(l => (
            <a key={l} href="#" className="text-stone-600 text-xs hover:text-stone-400 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── Root export ──────────────────────────────────────────────────────────────
export const RootedLanding = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#080e1a" }}>
      {/* ── Nav (fixed, always on top) ── */}
      <Nav />

      {/* ── Hero with scroll animation ── */}
      <div style={{ background: "#080e1a" }} className="pt-14">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center text-center gap-4 pb-6">
              <motion.p
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0, transition: { delay: .3, duration: .6 } }}
                className="text-stone-400 font-semibold tracking-[.35em] uppercase animate-float-slow"
                style={{ fontSize: "21px" }}>
                🌱ROOTED
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1, transition: { delay: .5, duration: .7 } }}
                className="animate-float"
                style={{ fontFamily: "'Press Start 2P',monospace", lineHeight: 1.35 }}>
                <span className="block text-3xl md:text-5xl lg:text-6xl"
                  style={{ color: "#78E04A", textShadow: "3px 3px 0 #1E6010,5px 5px 0 #0A3808" }}>Grow your Career from Ground Up</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: .8, duration: .7 } }}
                className="text-stone-400 text-sm md:text-base leading-relaxed max-w-md">
                The most fun way to grow your career skills in college — one level at a time.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 1, duration: .6 } }}
                className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <Link href="/signup" className={PIXEL_BTN} style={PIXEL_BTN_STYLE()}>Get Started</Link>
                <button className={PIXEL_BTN}
                  style={PIXEL_BTN_STYLE("#122040", "#1e3a6a", "#06111e")}>
                  <span style={{ color: "#6ED640" }}>Explore Paths</span>
                </button>
              </motion.div>
            </div>
          }
        >
          {/* Product screenshot inside the hero tablet frame */}
          <div className="relative h-full w-full bg-[#080e1a]">
            <Image
              src="/images/landing-skill-tree.png"
              alt="Rooted Skill Tree — Software Engineer path with nodes, XP, and progress"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        </ContainerScroll>
      </div>

      <StatsTicker />
      <PathsSection />
      <HowItWorks />
      <TreeViz />
      <GamificationSection />
      <BalanceSection />
      <SocialProof />
      <FinalCta />
      <Footer />
    </div>
  );
};
