"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

// ─── Pixel scene canvas ───────────────────────────────────────────────────────
// Drawn at low resolution (480×270) then scaled up in CSS with
// image-rendering: pixelated — this produces the crunchy 16-bit look.

const CW = 480;
const CH = 270;

type Ctx = CanvasRenderingContext2D;

const fx = (n: number) => ~~n; // fast floor

function fill(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(fx(x), fx(y), Math.max(1, fx(w)), Math.max(1, fx(h)));
}

// ─── Sky ──────────────────────────────────────────────────────────────────────
function drawSky(ctx: Ctx, h: number) {
  const bands = [
    "#1B4882","#1E5090","#265CA0","#306BB0","#3A7BBF",
    "#4A8ECC","#5A9FD8","#70B2E4","#87CEEB","#9DD7F0",
    "#B0E0F7","#C5EAF9",
  ];
  const bh = (h * 0.64) / bands.length;
  bands.forEach((c, i) => fill(ctx, 0, i * bh, CW, bh + 1, c));
}

// ─── Clouds ───────────────────────────────────────────────────────────────────
function drawCloud(ctx: Ctx, cx: number, cy: number, s: number) {
  fill(ctx, cx + 3, cy + 4, s * 0.95, s * 0.38, "#A8CAD8");     // shadow
  fill(ctx, cx, cy + s * 0.28, s * 0.72, s * 0.38, "#D4EDF7");
  fill(ctx, cx + s * 0.12, cy + s * 0.1, s * 0.64, s * 0.52, "#E8F5FB");
  fill(ctx, cx + s * 0.28, cy, s * 0.5, s * 0.58, "#F4FAFE");
  fill(ctx, cx + s * 0.04, cy + s * 0.22, s * 0.92, s * 0.36, "#FFFFFF");
}

// ─── Mountains ────────────────────────────────────────────────────────────────
function drawMtn(
  ctx: Ctx,
  px: number, py: number, baseY: number,
  fill_c: string, shadow_c: string, snowY?: number
) {
  const mh = baseY - py;
  for (let y = fx(py); y < fx(baseY); y++) {
    const prog = (y - py) / mh;
    const hw = prog * mh * 0.72;
    ctx.fillStyle = fill_c;
    ctx.fillRect(fx(px - hw), y, Math.max(1, fx(hw * 2)), 1);
    // right-face shadow
    ctx.fillStyle = shadow_c;
    ctx.fillRect(fx(px + hw * 0.28), y, Math.max(1, fx(hw * 0.72)), 1);
    // snow cap
    if (snowY !== undefined && y < py + (baseY - py) * 0.18) {
      ctx.fillStyle = "#D8EDF5";
      ctx.fillRect(fx(px - hw * 0.5), y, Math.max(1, fx(hw)), 1);
    }
  }
}

// ─── Trees ────────────────────────────────────────────────────────────────────
function drawTree(ctx: Ctx, x: number, base: number, size: number) {
  const tw = Math.max(2, fx(size * 0.11));
  const th = fx(size * 0.26);
  const cw = fx(size * 0.56);
  // trunk
  fill(ctx, x - tw / 2, base - th, tw, th, "#3A1E0A");
  // 3-tier pine canopy
  const tiers: [string, number, number][] = [
    ["#132E12", base - th - fx(size * 0.26), cw],
    ["#1C4A1C", base - th - fx(size * 0.50), fx(cw * 0.76)],
    ["#286030", base - th - fx(size * 0.72), fx(cw * 0.52)],
  ];
  tiers.forEach(([c, ty, tw2]) => {
    fill(ctx, x - tw2 / 2, ty, tw2, fx(size * 0.32), c);
    fill(ctx, x - tw2 / 2, ty, 2, fx(size * 0.28), "#30703A"); // left highlight
  });
}

// ─── Grass layers ─────────────────────────────────────────────────────────────
function drawGrass(ctx: Ctx, w: number, h: number, t: number) {
  // far solid ground
  fill(ctx, 0, h * 0.64, w, h * 0.36, "#1C4818");

  // rolling mid hill
  ctx.fillStyle = "#286A20";
  for (let x = 0; x < w; x++) {
    const wy = fx(h * 0.685 + Math.sin(x * 0.038 + t * 0.28) * 4.5);
    ctx.fillRect(x, wy, 1, h - wy);
  }

  // second hill
  ctx.fillStyle = "#389030";
  for (let x = 0; x < w; x++) {
    const wy = fx(h * 0.765 + Math.sin(x * 0.055 + t * 0.38 + 1.4) * 3.5);
    ctx.fillRect(x, wy, 1, h - wy);
  }

  // front dark strip
  fill(ctx, 0, h * 0.87, w, h * 0.13, "#112010");

  // animated blades on second hill edge
  ctx.fillStyle = "#48A038";
  for (let x = 0; x < w; x += 3) {
    const wy = fx(h * 0.765 + Math.sin(x * 0.055 + t * 0.38 + 1.4) * 3.5);
    const b = fx(Math.sin(x * 0.28 + t * 2.0) * 3);
    ctx.fillRect(x, wy - 5 + b, 2, 6);
  }
  ctx.fillStyle = "#389030";
  for (let x = 2; x < w; x += 5) {
    const wy = fx(h * 0.765 + Math.sin(x * 0.055 + t * 0.38 + 1.4) * 3.5);
    const b = fx(Math.sin(x * 0.32 + t * 2.4 + 0.9) * 2);
    ctx.fillRect(x, wy - 4 + b, 1, 5);
  }
}

// ─── Pixel flower ─────────────────────────────────────────────────────────────
function drawFlower(ctx: Ctx, x: number, y: number, petal: string) {
  fill(ctx, x, y - 8, 1, 8, "#3A8820");           // stem
  fill(ctx, x - 3, y - 10, 7, 3, petal);           // petals H
  fill(ctx, x - 1, y - 12, 3, 7, petal);           // petals V
  fill(ctx, x, y - 10, 1, 1, "#F2DC40");           // center
}

// ─── Sapling mascot ───────────────────────────────────────────────────────────
function drawSapling(ctx: Ctx, x: number, y: number, t: number) {
  // underground roots
  ctx.fillStyle = "#5A3010";
  for (let i = 1; i <= 10; i++) {
    const rw = 2;
    ctx.fillRect(fx(x - 2 - i * 2.2), fx(y + i * 1.3), rw, rw);
    ctx.fillRect(fx(x + 2 + i * 2.2), fx(y + i * 1.3), rw, rw);
    if (i % 3 === 0) {
      ctx.fillRect(fx(x - 2 - i * 2.2 - 3), fx(y + i * 1.3 + 2), rw, rw);
      ctx.fillRect(fx(x + 2 + i * 2.2 + 3), fx(y + i * 1.3 + 2), rw, rw);
    }
  }
  ctx.fillRect(fx(x - 1), fx(y), 2, 14); // tap root

  // trunk
  fill(ctx, x - 3, y - 28, 6, 28, "#4A2A10");
  fill(ctx, x - 1, y - 28, 3, 28, "#5E3618");

  // leaves with wind sway
  const sw = Math.sin(t * 1.25) * 2;
  const leaf: [number, number, number, number, string][] = [
    [x - 15 + sw,     y - 38,  30, 12, "#163816"],
    [x - 13 + sw,     y - 40,  26, 10, "#1E5020"],
    [x - 11 + sw*0.8, y - 50,  22, 14, "#267028"],
    [x -  9 + sw*0.8, y - 52,  18, 12, "#308030"],
    [x -  6 + sw*0.6, y - 62,  12, 14, "#3A9038"],
    [x -  4 + sw*0.5, y - 66,   8, 10, "#46A042"],
    [x -  2 + sw*0.3, y - 74,   4,  8, "#55B850"],
  ];
  leaf.forEach(([lx, ly, lw, lh, c]) => fill(ctx, lx, ly, lw, lh, c));

  // subtle glow pulse
  const ga = 0.055 + Math.sin(t * 1.6) * 0.025;
  ctx.fillStyle = `rgba(80,200,80,${ga})`;
  ctx.fillRect(fx(x - 28), fx(y - 82), 56, 66);

  // floating skill nodes
  const snodes = [
    { ox: -22, oy: -55, ph: 0.0 },
    { ox:  24, oy: -50, ph: 1.1 },
    { ox: -16, oy: -32, ph: 2.2 },
    { ox:  20, oy: -28, ph: 1.7 },
    { ox:   4, oy: -80, ph: 0.6 },
  ];
  snodes.forEach(({ ox, oy, ph }) => {
    const nx = x + ox + Math.sin(t * 0.85 + ph) * 3.5;
    const ny = y + oy + Math.cos(t * 0.65 + ph) * 2.5;
    const na = 0.55 + Math.sin(t + ph) * 0.35;
    ctx.fillStyle = `rgba(100,230,110,${na})`;
    ctx.fillRect(fx(nx) - 2, fx(ny) - 2, 4, 4);
    ctx.fillStyle = `rgba(160,255,160,${na * 0.45})`;
    ctx.fillRect(fx(nx) - 4, fx(ny) - 4, 8, 8);
  });
}

// ─── Master render ────────────────────────────────────────────────────────────
function renderScene(ctx: Ctx, t: number) {
  const w = CW, h = CH;
  ctx.clearRect(0, 0, w, h);

  drawSky(ctx, h);

  // clouds
  [
    [18  + Math.sin(t * 0.042) * 4, 16, 54],
    [128 + Math.sin(t * 0.053 + 1.0) * 3, 7, 70],
    [255 + Math.cos(t * 0.038 + 0.5) * 5, 20, 46],
    [362 + Math.sin(t * 0.047 + 2.1) * 3, 11, 62],
  ].forEach(([cx, cy, s]) => drawCloud(ctx, cx, cy, s));

  // back mountains (darker, smaller)
  const backMtns: [number, number][] = [
    [w*0.06,h*0.33],[w*0.20,h*0.27],[w*0.36,h*0.31],[w*0.52,h*0.24],
    [w*0.67,h*0.29],[w*0.82,h*0.26],[w*0.94,h*0.34],
  ];
  backMtns.forEach(([px, py]) =>
    drawMtn(ctx, px, py, h * 0.64, "#163020", "#0E2018")
  );

  // mid mountains (brighter, bigger, snow)
  const midMtns: [number, number][] = [
    [w*0.13,h*0.39],[w*0.32,h*0.32],[w*0.58,h*0.35],[w*0.80,h*0.31],
  ];
  midMtns.forEach(([px, py]) =>
    drawMtn(ctx, px, py, h * 0.645, "#1E3C2C", "#152A20", py)
  );

  // trees (gap in centre for sapling)
  const trees = [
    {x:12,s:36},{x:38,s:45},{x:66,s:38},{x:93,s:49},
    {x:124,s:41},{x:152,s:37},{x:180,s:50},
    // gap 210–290 for sapling
    {x:302,s:49},{x:332,s:38},{x:360,s:46},
    {x:390,s:37},{x:418,s:52},{x:450,s:41},
  ];
  trees.forEach(({ x, s }) => drawTree(ctx, x, fx(h * 0.80), s));

  drawGrass(ctx, w, h, t);

  // flowers
  const fls = [
    {x:26,c:"#E090C8"},{x:60,c:"#C070B8"},{x:100,c:"#E090C8"},
    {x:140,c:"#F0D060"},{x:168,c:"#D080C0"},
    {x:308,c:"#E090C8"},{x:346,c:"#F0D060"},{x:382,c:"#C070B8"},
    {x:418,c:"#E090C8"},{x:456,c:"#F0D060"},
  ];
  fls.forEach(({ x, c }) => {
    const fy = fx(h * 0.847 + Math.sin(t * 0.75 + x * 0.085) * 1.5);
    drawFlower(ctx, x, fy, c);
  });

  // sapling centred slightly left of middle
  drawSapling(ctx, fx(w * 0.47), fx(h * 0.857), t);
}

// ─── Canvas component ─────────────────────────────────────────────────────────
const PixelScene = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let raf: number;
    const t0 = performance.now();

    const loop = () => {
      renderScene(ctx, (performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      width={CW}
      height={CH}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
};

// ─── Navigation ───────────────────────────────────────────────────────────────
const HeroNav = () => (
  <motion.nav
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.6 } }}
    className="absolute top-0 left-0 right-0 z-20"
    style={{ background: "rgba(8,16,12,0.82)" }}
  >
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <span className="text-lg leading-none">🌱</span>
        <span
          className="font-bold text-white tracking-wide"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "12px" }}
        >
          ROOTED
        </span>
      </div>

      {/* Links */}
      <nav className="hidden md:flex items-center gap-7 text-sm text-stone-300 font-medium">
        {["Learn", "Skill Trees", "Community", "Pricing"].map((l) => (
          <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
        ))}
      </nav>

      {/* CTA */}
      <button
        className="font-bold text-stone-900 transition-all hover:brightness-110 active:scale-95"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "10px",
          background: "#6ED640",
          border: "2px solid #3A9018",
          boxShadow: "0 3px 0 #267010",
          padding: "8px 16px",
        }}
      >
        Sign up
      </button>
    </div>
  </motion.nav>
);

// ─── Hero overlay content ─────────────────────────────────────────────────────
const HeroContent = () => (
  <div
    className="absolute inset-0 z-10 flex flex-col items-center justify-start text-center px-4"
    style={{ paddingTop: "12%" }}
  >
    {/* "START YOUR" label */}
    <motion.p
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.6 } }}
      className="text-stone-200 font-semibold tracking-[0.35em] uppercase mb-3 drop-shadow"
      style={{ fontSize: "11px" }}
    >
      Start Your
    </motion.p>

    {/* Big pixel headline */}
    <motion.h1
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: 0.6, duration: 0.7, ease: "easeOut" } }}
      style={{ fontFamily: "'Press Start 2P', monospace", lineHeight: 1.35 }}
      className="text-white"
    >
      <span
        className="block text-3xl md:text-5xl lg:text-6xl"
        style={{
          color: "#78E04A",
          textShadow: "3px 3px 0 #1E6010, 5px 5px 0 #0A3808",
        }}
      >
        Skill
      </span>
      <span
        className="block text-3xl md:text-5xl lg:text-6xl"
        style={{
          color: "#90F060",
          textShadow: "3px 3px 0 #1E6010, 5px 5px 0 #0A3808",
        }}
      >
        Journey.
      </span>
    </motion.h1>

    {/* Subtext */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.95, duration: 0.7 } }}
      className="mt-5 text-stone-100 text-sm md:text-[15px] max-w-sm leading-relaxed"
      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
    >
      The most fun way to grow your career skills in college — one level at a time.
    </motion.p>

    {/* CTA */}
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 1.15, duration: 0.6 } }}
      whileHover={{ y: -2, filter: "brightness(1.08)" }}
      whileTap={{ scale: 0.96 }}
      className="mt-7 font-bold text-stone-900 transition-all"
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "11px",
        background: "#6ED640",
        border: "3px solid #3A9018",
        boxShadow: "0 5px 0 #1E6010, 0 7px 0 rgba(0,0,0,0.35)",
        padding: "14px 32px",
      }}
    >
      Get Started
    </motion.button>

    {/* Supported by */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1.45, duration: 0.6 } }}
      className="mt-10 flex flex-col items-center gap-2"
    >
      <p
        className="text-stone-400 tracking-widest uppercase"
        style={{ fontSize: "13px" }}
      >
        Supported by
      </p>
      <div className="flex items-center gap-5 text-stone-300 font-semibold text-xs">
        <span>GitHub</span>
        <span className="text-stone-600">·</span>
        <span>Product Hunt</span>
        <span className="text-stone-600">·</span>
        <span>YC Alumni</span>
      </div>
    </motion.div>
  </div>
);

// ─── Below-fold feature section ───────────────────────────────────────────────
const FeaturesSection = () => {
  const cards = [
    {
      emoji: "🌳",
      title: "Skill Tree",
      body: "Your entire career path as a branching tree. Unlock nodes as you level up — never wonder what to learn next.",
    },
    {
      emoji: "📊",
      title: "Progress Tracking",
      body: "Every hour, every skill, every milestone logged. Watch your roots grow deeper in real time.",
    },
    {
      emoji: "⚖️",
      title: "Balance System",
      body: "Smart scheduling that fits school, work, and skill-building together — without the burnout.",
    },
  ];

  return (
    <section className="bg-[#0C1A0C] px-6 py-16 border-t border-stone-800">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-white mb-12"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "15px",
            lineHeight: 2,
          }}
        >
          Explore 100+ skill paths
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="rounded-xl border border-stone-700 bg-stone-900 p-6 hover:border-green-800 transition-colors"
            >
              <div className="text-3xl mb-4">{c.emoji}</div>
              <h3
                className="text-white mb-3"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "10px",
                  lineHeight: 1.9,
                }}
              >
                {c.title}
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Root export ──────────────────────────────────────────────────────────────
export const RootedHero = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0C1A0C]">
      {/* Pixel art hero — 16:9 viewport fill */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <PixelScene />
        <HeroNav />
        <HeroContent />
      </div>

      <FeaturesSection />
    </div>
  );
};
