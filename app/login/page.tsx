"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ── Pixel Night-Sky Canvas (shared with signup) ───────────────────────────────

const CW = 1200, CH = 700;
type Ctx = CanvasRenderingContext2D;
const f = (n: number) => ~~n;
const rect = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(f(x), f(y), Math.max(1, f(w)), Math.max(1, f(h)));
};

const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 137 + 42) % CW,
  y: (i * 79 + 17) % (CH * 0.7),
  r: 1 + (i % 3),
  phase: i * 0.4,
  twinkle: 1.5 + (i % 4) * 0.6,
}));

function drawSparkle(ctx: Ctx, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.fillStyle = color.slice(0, 7) + Math.round(alpha * 255).toString(16).padStart(2, "0");
  ctx.fillRect(f(x - size / 2), f(y), f(size), 1);
  ctx.fillRect(f(x), f(y - size / 2), 1, f(size));
  ctx.fillRect(f(x - 1), f(y - 1), 3, 3);
}

function drawPixelCloud(ctx: Ctx, cx: number, cy: number, w: number, h: number) {
  const shades = ["#0d2a52", "#0f3060", "#112e5a", "#0d264c"];
  rect(ctx, cx, cy + h * 0.4, w, h * 0.6, shades[0]);
  const bumps = [
    { ox: w * 0.05, r: h * 0.55 }, { ox: w * 0.22, r: h * 0.72 },
    { ox: w * 0.42, r: h * 0.85 }, { ox: w * 0.60, r: h * 0.78 },
    { ox: w * 0.78, r: h * 0.60 }, { ox: w * 0.90, r: h * 0.45 },
  ];
  bumps.forEach(({ ox, r }, i) => {
    ctx.fillStyle = shades[i % shades.length];
    ctx.beginPath();
    ctx.arc(f(cx + ox), f(cy + h * 0.4), f(r), Math.PI, 0);
    ctx.fill();
  });
}

function renderSky(ctx: Ctx, t: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, CH);
  sky.addColorStop(0, "#030a1a");
  sky.addColorStop(0.55, "#061230");
  sky.addColorStop(1, "#0d2448");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CW, CH);

  STARS.forEach(s => {
    const a = 0.4 + Math.sin(t * s.twinkle + s.phase) * 0.5;
    ctx.fillStyle = `rgba(150,200,255,${Math.max(0, a)})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  });

  const sparkles = [
    { x: CW * 0.12, y: CH * 0.12 }, { x: CW * 0.78, y: CH * 0.08 },
    { x: CW * 0.55, y: CH * 0.22 }, { x: CW * 0.92, y: CH * 0.28 },
    { x: CW * 0.06, y: CH * 0.38 }, { x: CW * 0.88, y: CH * 0.45 },
  ];
  sparkles.forEach((s, i) => {
    drawSparkle(ctx, s.x, s.y, 8 + (i % 3) * 3, "#60C0FF", 0.5 + Math.sin(t * 1.3 + i * 1.2) * 0.4);
  });

  [
    { cx: -50, cy: CH * 0.68, w: 260, h: 90 },
    { cx: 180, cy: CH * 0.74, w: 340, h: 110 },
    { cx: 480, cy: CH * 0.70, w: 290, h: 95 },
    { cx: 730, cy: CH * 0.76, w: 380, h: 120 },
    { cx: 1050, cy: CH * 0.72, w: 260, h: 88 },
  ].forEach(c => drawPixelCloud(ctx, c.cx, c.cy, c.w, c.h));
}

const NightSkyCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const t0 = performance.now();
    let raf: number;
    const loop = () => { renderSky(ctx, (performance.now() - t0) / 1000); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={ref} width={CW} height={CH}
      className="fixed inset-0 w-full h-full"
      style={{ imageRendering: "pixelated", objectFit: "cover" }} />
  );
};

// ── Pixel Robot Mascot ────────────────────────────────────────────────────────

const PixelRobot = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const t0 = performance.now();
    let raf: number;
    const W = canvas.width, H = canvas.height;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const bob = Math.sin(t * 1.8) * 2;
      const ey = 28 + bob;
      rect(ctx, 14, 30 + bob, 52, 42, "#2a4a7a");
      rect(ctx, 16, 32 + bob, 48, 38, "#3a6aaa");
      rect(ctx, 18, 34 + bob, 44, 32, "#1a3a6a");
      rect(ctx, 20, 36 + bob, 40, 28, "#4a8acc");
      [38, 44, 50, 56].forEach((y, i) => {
        rect(ctx, 22, y + bob, [28, 20, 24, 16][i], 3, i === 0 ? "#6ED640" : "#2a6020");
      });
      if (t % 1 < 0.6) rect(ctx, 22, 56 + bob, 4, 3, "#6ED640");
      rect(ctx, 14, 72 + bob, 52, 6, "#1a3a6a");
      rect(ctx, 22, 78 + bob, 8, 8, "#2a4a7a");
      rect(ctx, 50, 78 + bob, 8, 8, "#2a4a7a");
      rect(ctx, 18, 84 + bob, 12, 4, "#1a2a5a");
      rect(ctx, 50, 84 + bob, 12, 4, "#1a2a5a");
      rect(ctx, 22, ey - 2, 36, 4, "#2a4a7a");
      rect(ctx, 20, ey - 18, 40, 18, "#3a6aaa");
      rect(ctx, 22, ey - 20, 36, 4, "#2a4a7a");
      const blink = (t % 4) < 3.7;
      rect(ctx, 26, ey - 14, 6, blink ? 5 : 1, "#6ED640");
      rect(ctx, 48, ey - 14, 6, blink ? 5 : 1, "#6ED640");
      rect(ctx, 38, ey - 28, 4, 10, "#4a7acc");
      rect(ctx, 35, ey - 32, 10, 5, "#6ED640");
      const ablink = 0.5 + Math.sin(t * 3) * 0.5;
      ctx.fillStyle = `rgba(110,214,64,${ablink})`;
      ctx.fillRect(38, f(ey - 34), 4, 3);
      rect(ctx, 4, 38 + bob, 10, 6, "#2a4a7a");
      rect(ctx, 66, 38 + bob, 10, 6, "#2a4a7a");
      rect(ctx, 0, 40 + bob, 6, 4, "#4a7acc");
      rect(ctx, 74, 40 + bob, 6, 4, "#4a7acc");
    };

    const loop = () => { draw((performance.now() - t0) / 1000); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={ref} width={80} height={96} className="w-20 h-24"
      style={{ imageRendering: "pixelated" }} />
  );
};

// ── Eye icon ──────────────────────────────────────────────────────────────────

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

// ── OAuth button ──────────────────────────────────────────────────────────────

const OAuthBtn = ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
    style={{
      background: "#0d1a2e", border: "3px solid #1e3858",
      boxShadow: "3px 3px 0 #020810", cursor: "pointer",
      transition: "transform 0.12s, box-shadow 0.12s, border-color 0.12s",
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLButtonElement;
      el.style.borderColor = "#6ED640"; el.style.transform = "translate(-1px,-1px)";
      el.style.boxShadow = "4px 4px 0 #020810";
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLButtonElement;
      el.style.borderColor = "#1e3858"; el.style.transform = "";
      el.style.boxShadow = "3px 3px 0 #020810";
    }}
  >
    {children}
  </button>
);

// ── Login Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("OAuth error:", error.message);
      setLoading(false);
    }
  };

  const PX_FONT = "'Press Start 2P', monospace";
  const INPUT_STYLE: React.CSSProperties = {
    width: "100%", background: "#040d1a", border: "3px solid #1e3858",
    color: "#f0f0ec", padding: "12px 14px", fontSize: "13px", outline: "none",
    boxShadow: "3px 3px 0 #020810", fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  return (
    <>
      <NightSkyCanvas />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5 } }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(3,8,22,0.88)", backdropFilter: "blur(8px)", borderBottom: "1px solid #1e3858" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <span style={{ fontFamily: PX_FONT, fontSize: "12px", color: "#fff" }}>ROOTED</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-stone-300 font-medium">
          {["Learn", "Skill Trees", "Community", "Pricing"].map(l => (
            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
          ))}
        </nav>
        <Link href="/signup" className="font-bold text-stone-900 transition-all active:scale-95"
          style={{
            fontFamily: PX_FONT, fontSize: "10px", background: "#6ED640",
            border: "3px solid #3A9018", boxShadow: "0 4px 0 #1E6010", padding: "10px 18px",
          }}>
          Sign up
        </Link>
      </motion.nav>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-16 pb-8">

        {/* Mascot + bubble */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } }}
          className="flex items-end gap-0 mb-2"
        >
          <PixelRobot />
          <div
            className="relative ml-3 mb-4 px-4 py-3"
            style={{
              background: "#fff", border: "3px solid #c8d8e8",
              boxShadow: "3px 3px 0 #a0b4c8", color: "#1a2a3a",
              fontFamily: PX_FONT, fontSize: "8px", lineHeight: 1.8, maxWidth: "230px",
            }}
          >
            <div style={{ position: "absolute", left: "-12px", bottom: "18px", width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "12px solid #c8d8e8" }} />
            <div style={{ position: "absolute", left: "-8px", bottom: "19px", width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "10px solid #fff" }} />
            Log in to resume<br />your adventure~ 🌱
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.6 } }}
          style={{
            background: "#080e1a", border: "3px solid #1e3858",
            boxShadow: "6px 6px 0 #020810, 8px 8px 0 rgba(0,0,0,0.4)",
            width: "100%", maxWidth: "420px",
          }}
        >
          {/* Top accent strip */}
          <div style={{ height: "4px", background: "repeating-linear-gradient(90deg, #6ED640 0px, #6ED640 8px, #3A9018 8px, #3A9018 10px)" }} />

          <div className="p-7">
            <div className="text-center mb-6">
              <p style={{ fontFamily: PX_FONT, fontSize: "9px", color: "#6ED640", letterSpacing: "0.1em" }}>
                ▸ WELCOME BACK
              </p>
              <h1
                className="mt-3 mb-2"
                style={{
                  fontFamily: PX_FONT,
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#78E04A",
                  textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808",
                }}
              >
                Log in to<br />Rooted
              </h1>
              <p className="text-stone-400 mt-2" style={{ fontSize: "11px" }}>Pick up right where you left off.</p>
            </div>

            {/* OAuth */}
            <div className="flex gap-3 mb-5">
              <OAuthBtn onClick={() => handleOAuthLogin('google')} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </OAuthBtn>
              <OAuthBtn onClick={() => handleOAuthLogin('github')} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </OAuthBtn>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div style={{ flex: 1, height: "1px", background: "#1e3858" }} />
              <span style={{ color: "#4a6a8a", fontSize: "11px", fontFamily: PX_FONT }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "#1e3858" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={INPUT_STYLE}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#6ED640"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#1e3858"}
              />

              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ ...INPUT_STYLE, paddingRight: "44px" }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#6ED640"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#1e3858"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#6ED640] transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>

              {errorMsg && (
                <p style={{ color: "#f87171", fontSize: "11px", fontFamily: PX_FONT, lineHeight: 1.6 }}>
                  ⚠ {errorMsg}
                </p>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full font-bold text-stone-900 active:scale-95 mt-1"
                style={{
                  fontFamily: PX_FONT, fontSize: "10px",
                  background: loading ? "#3A9018" : "#6ED640",
                  border: "3px solid #3A9018",
                  boxShadow: loading ? "none" : "0 5px 0 #1E6010, 0 7px 0 rgba(0,0,0,0.4)",
                  padding: "14px 24px", cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.05em",
                  transform: loading ? "translateY(4px)" : "",
                  transition: "transform 0.1s, box-shadow 0.1s",
                }}
              >
                {loading ? "LOADING..." : "LOG IN →"}
              </button>
            </form>

            {/* Pixel dashed divider */}
            <div className="my-5" style={{ height: "2px", background: "repeating-linear-gradient(90deg, #1e3858 0px, #1e3858 6px, transparent 6px, transparent 8px)" }} />

            {/* Bottom links */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-stone-400 text-sm">
                Need an account?{" "}
                <Link href="/signup" className="font-semibold transition-colors" style={{ color: "#6ED640" }}>
                  Sign up
                </Link>
              </p>
              <a
                href="#"
                className="text-sm transition-colors"
                style={{ color: "#4a6a8a" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#6ED640"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#4a6a8a"}
              >
                Reset password
              </a>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.8 } }}
          className="text-stone-600 text-xs mt-6"
        >
          © 2025 Rooted. Free to start. Always.
        </motion.p>
      </div>
    </>
  );
}
