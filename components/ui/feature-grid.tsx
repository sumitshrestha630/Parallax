"use client";
import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PixelScene =
  | "code"        // green terminal / code rain
  | "data"        // bar chart / data pulses
  | "design"      // grid + colour swatches
  | "product"     // roadmap board
  | "security"    // matrix lines + shield
  | "cloud"       // drifting clouds + nodes
  | "goal"        // star / target crosshair
  | "tree"        // pixel tree growing
  | "levelup"     // XP bar filling + star burst
  | "avatar"      // pixel person portrait
  | "student1"    // pixel bust — purple tones
  | "student2"    // pixel bust — blue tones
  | "student3";   // pixel bust — pink tones

export interface Feature {
  pixelScene: PixelScene;
  imageAlt: string;
  label?: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  isNew?: boolean;
}

export interface FeatureGridProps {
  features: Feature[];
  className?: string;
}

// ── Pixel canvas scenes ───────────────────────────────────────────────────────

type DrawFn = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void;

const f = (n: number) => ~~n;
const rect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, c: string
) => { ctx.fillStyle = c; ctx.fillRect(f(x), f(y), Math.max(1, f(w)), Math.max(1, f(h))); };

// 1. CODE RAIN — green characters scrolling
const drawCode: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#040d08");
  const cols = 22, cw = w / cols;
  for (let c = 0; c < cols; c++) {
    const speed = 28 + (c * 7) % 40;
    const chars = ["0","1","1","0","A","B","C","F","1","0"];
    const count = 8 + (c * 3) % 6;
    for (let r = 0; r < count; r++) {
      const charIdx = (c * 3 + r) % chars.length;
      const y = ((t * speed + r * (h / count)) % (h + 16)) - 16;
      const alpha = 1 - r / count;
      const bright = r === 0;
      ctx.fillStyle = bright ? `rgba(110,214,64,${alpha})` : `rgba(40,160,40,${alpha * 0.7})`;
      ctx.font = `bold ${f(cw * 0.72)}px monospace`;
      ctx.fillText(chars[charIdx], f(c * cw + 2), f(y));
    }
  }
  // scanlines
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
};

// 2. DATA — pulsing bar chart
const drawData: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#060c1a");
  const bars = [0.6, 0.85, 0.45, 0.95, 0.7, 0.55, 0.8, 0.4];
  const bw = w / (bars.length * 1.8);
  const gap = bw * 0.8;
  const colors = ["#60A5FA","#6ED640","#FBBF24","#60A5FA","#F472B6","#6ED640","#FBBF24","#60A5FA"];
  bars.forEach((base, i) => {
    const pct = base + Math.sin(t * 1.2 + i * 0.9) * 0.12;
    const bh = h * 0.7 * pct;
    const x = gap + i * (bw + gap);
    const y = h * 0.85 - bh;
    // shadow
    rect(ctx, x + 2, y + 2, bw, bh, "rgba(0,0,0,0.3)");
    // bar body
    const g = ctx.createLinearGradient(0, y, 0, y + bh);
    g.addColorStop(0, colors[i]);
    g.addColorStop(1, colors[i] + "55");
    ctx.fillStyle = g;
    ctx.fillRect(f(x), f(y), f(bw), f(bh));
    // top glow pixel
    rect(ctx, x, y, bw, 3, "#ffffff44");
  });
  // baseline
  rect(ctx, gap * 0.5, h * 0.85, w - gap, 2, "#1e3858");
};

// 3. DESIGN — pixel canvas with colour palette
const drawDesign: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#0a0a14");
  // grid
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // pixel art face outline
  const cx = w * 0.45, cy = h * 0.45, ps = Math.max(2, f(w / 24));
  const palette = ["#F472B6","#A78BFA","#60A5FA","#6ED640","#FBBF24","#F97316"];
  // swatches row
  palette.forEach((c, i) => {
    const blink = i === f(t * 1.5) % palette.length;
    rect(ctx, 12 + i * (ps * 2 + 4), h - ps * 3, ps * 2, ps * 2, c);
    if (blink) rect(ctx, 12 + i * (ps * 2 + 4) - 2, h - ps * 3 - 2, ps * 2 + 4, ps * 2 + 4, "#ffffff55");
  });
  // pixel art house / icon being drawn
  const progress = (Math.sin(t * 0.5) * 0.5 + 0.5);
  const pixels: [number, number, string][] = [
    [0,2,"#6ED640"],[1,2,"#6ED640"],[2,2,"#6ED640"],[3,2,"#6ED640"],[4,2,"#6ED640"],
    [1,1,"#6ED640"],[2,0,"#6ED640"],[3,1,"#6ED640"],
    [0,3,"#3A9018"],[4,3,"#3A9018"],[1,3,"#523010"],[2,3,"#523010"],[3,3,"#523010"],
    [0,4,"#3A9018"],[4,4,"#3A9018"],[1,4,"#523010"],[2,4,"#E0D060"],[3,4,"#523010"],
    [0,5,"#3A9018"],[4,5,"#3A9018"],[1,5,"#523010"],[3,5,"#523010"],
  ];
  const show = Math.ceil(pixels.length * progress);
  pixels.slice(0, show).forEach(([px, py, c]) => {
    rect(ctx, cx + (px - 2) * (ps + 1), cy + (py - 2) * (ps + 1), ps, ps, c);
  });
  // cursor blink
  if (show < pixels.length) {
    const [nx, ny] = [pixels[show][0], pixels[show][1]];
    if (t % 1 < 0.6) rect(ctx, cx + (nx - 2) * (ps + 1), cy + (ny - 2) * (ps + 1), ps, ps, "#ffffff");
  }
};

// 4. PRODUCT — kanban/roadmap board
const drawProduct: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#07111f");
  const cols = ["#1e2d44","#162238","#1a3020"];
  const labels = ["BACKLOG","IN PROGRESS","DONE"];
  const colW = (w - 16) / 3;
  const lc = ["#4a6686","#5a90d0","#6ED640"];
  cols.forEach((bg, ci) => {
    rect(ctx, 8 + ci * (colW + 4), 8, colW, h - 16, bg);
    ctx.fillStyle = lc[ci];
    ctx.font = `bold 7px monospace`;
    ctx.fillText(labels[ci], f(12 + ci * (colW + 4)), 22);
    // cards
    const cardCount = [3, 2, 4][ci];
    for (let r = 0; r < cardCount; r++) {
      const cardY = 28 + r * 24;
      if (cardY + 18 > h - 8) break;
      const pulse = ci === 1 && r === 0 ? Math.abs(Math.sin(t * 1.5)) * 0.3 : 0;
      const cc = ci === 2 ? "#1e4a28" : ci === 1 ? "#1a3050" : "#0d1c30";
      const bc = ci === 2 ? "#3A9018" : ci === 1 ? "#3060a0" : "#1e3858";
      ctx.fillStyle = cc;
      ctx.fillRect(f(12 + ci * (colW + 4)), f(cardY), f(colW - 8), 18);
      ctx.strokeStyle = bc;
      ctx.lineWidth = 1 + pulse;
      ctx.strokeRect(f(12 + ci * (colW + 4)), f(cardY), f(colW - 8), 18);
      // task bar
      rect(ctx, 16 + ci * (colW + 4), cardY + 5, (colW - 16) * [0.6, 0.8, 0.4, 0.9][r % 4], 4, lc[ci] + "88");
    }
  });
};

// 5. SECURITY — falling matrix + shield
const drawSecurity: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#03080a");
  // matrix chars
  const cols = 18;
  for (let c = 0; c < cols; c++) {
    const speed = 20 + (c * 11) % 35;
    const y = ((t * speed + c * 23) % (h + 12));
    const alpha = 0.15 + (c % 3) * 0.12;
    ctx.fillStyle = `rgba(0,255,70,${alpha})`;
    ctx.font = "9px monospace";
    ctx.fillText(["0","1","Z","X","A","F","3","7"][c % 8], f(c * (w / cols)), f(y));
  }
  // shield
  const sx = w / 2, sy = h / 2;
  const pulse = 0.85 + Math.sin(t * 2) * 0.15;
  const sr = f(Math.min(w, h) * 0.22 * pulse);
  // outer glow
  ctx.fillStyle = `rgba(0,255,70,0.06)`;
  ctx.beginPath(); ctx.arc(sx, sy, sr * 1.4, 0, Math.PI * 2); ctx.fill();
  // shield body
  ctx.fillStyle = "#0a2012";
  ctx.beginPath();
  ctx.moveTo(sx, sy - sr); ctx.lineTo(sx + sr, sy - sr * 0.3);
  ctx.lineTo(sx + sr, sy + sr * 0.3); ctx.lineTo(sx, sy + sr);
  ctx.lineTo(sx - sr, sy + sr * 0.3); ctx.lineTo(sx - sr, sy - sr * 0.3);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#00ff46";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // lock
  ctx.fillStyle = "#00ff46";
  ctx.font = `${f(sr * 0.7)}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("🔒", sx, sy + sr * 0.22);
  ctx.textAlign = "left";
};

// 6. CLOUD — node graph + drifting clouds
const drawCloud: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#060c1a");
  // grid lines
  ctx.strokeStyle = "#0e1a2e";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // nodes
  const nodes = [
    { x: 0.2, y: 0.5 }, { x: 0.5, y: 0.3 }, { x: 0.8, y: 0.5 },
    { x: 0.35, y: 0.7 }, { x: 0.65, y: 0.7 },
  ];
  const edges = [[0,1],[1,2],[0,3],[2,4],[3,1],[4,1]];
  // draw edges
  edges.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    const pulse = 0.3 + Math.abs(Math.sin(t * 1.2 + a * 0.8)) * 0.5;
    ctx.strokeStyle = `rgba(96,165,250,${pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(f(na.x * w), f(na.y * h)); ctx.lineTo(f(nb.x * w), f(nb.y * h)); ctx.stroke();
    // data packet animated along edge
    const frac = (t * 0.4 + a * 0.3) % 1;
    const px = f(na.x * w + (nb.x - na.x) * w * frac);
    const py = f(na.y * h + (nb.y - na.y) * h * frac);
    rect(ctx, px - 2, py - 2, 4, 4, "#60A5FA");
  });
  // draw nodes
  nodes.forEach((n, i) => {
    const r = i === 0 ? 8 : 6;
    ctx.fillStyle = "#0d1a2e";
    ctx.beginPath(); ctx.arc(f(n.x * w), f(n.y * h), r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = i === 0 ? "#6ED640" : "#60A5FA";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = i === 0 ? "#6ED640" : "#60A5FA";
    ctx.font = "7px monospace";
    ctx.textAlign = "center";
    ctx.fillText(["☁","S","DB","λ","API"][i], f(n.x * w), f(n.y * h + 2.5));
    ctx.textAlign = "left";
  });
};

// 7. GOAL — animated target / crosshair
const drawGoal: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#080814");
  const cx = w / 2, cy = h / 2;
  // starfield
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 137 + 50) % w);
    const sy = ((i * 79 + 20) % h);
    const alpha = 0.3 + Math.sin(t + i) * 0.3;
    ctx.fillStyle = `rgba(200,200,255,${alpha})`;
    ctx.fillRect(sx, sy, 1, 1);
  }
  // rings
  [36, 26, 16, 8].forEach((r, i) => {
    const colors = ["#1e2a50","#2a3a70","#3a4a90","#FBBF24"];
    const pulse = r + Math.sin(t * 1.5 + i) * 2;
    ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = colors[i]; ctx.lineWidth = i === 3 ? 2 : 1; ctx.stroke();
  });
  // crosshair
  const spin = t * 0.5;
  const len = 14;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin);
  ctx.strokeStyle = "#6ED640"; ctx.lineWidth = 1;
  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(a => {
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
    ctx.lineTo(Math.cos(a) * (10 + len), Math.sin(a) * (10 + len)); ctx.stroke();
  });
  ctx.restore();
  // center dot
  ctx.fillStyle = "#FBBF24";
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
  // star burst
  if (Math.sin(t * 0.8) > 0.7) {
    ctx.fillStyle = "rgba(251,191,36,0.25)";
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
  }
};

// 8. PIXEL TREE — growing tree scene
const drawTree: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#050e05");
  // sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, "#081818"); sky.addColorStop(1, "#0a1a10");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, f(h * 0.65));
  // ground
  rect(ctx, 0, h * 0.65, w, h * 0.35, "#0e1e0a");
  rect(ctx, 0, h * 0.65, w, 4, "#1e4010");
  // stars
  for (let i = 0; i < 18; i++) {
    const sx = (i * 131) % w, sy = (i * 67) % (h * 0.55);
    const a = 0.3 + Math.sin(t * 1.2 + i) * 0.3;
    ctx.fillStyle = `rgba(200,255,200,${a})`; ctx.fillRect(sx, sy, 1, 1);
  }
  // tree trunk + branches
  const tx = w / 2, baseY = h * 0.65;
  const growPct = Math.min(1, (Math.sin(t * 0.3) * 0.5 + 0.6));
  const treeH = h * 0.55 * growPct;
  rect(ctx, tx - 4, baseY - treeH, 8, treeH, "#3A1E0A");
  rect(ctx, tx - 2, baseY - treeH, 4, treeH, "#5E3618");
  // canopy tiers
  [0, 0.33, 0.6, 0.8].forEach((frac, tier) => {
    const ly = baseY - treeH * (1 - frac);
    const lw = (30 - tier * 6) * growPct;
    const lh = 12 * growPct;
    const sway = Math.sin(t * 1.1 + tier) * 2;
    const colors = ["#163016","#1C4A1C","#286030","#38803A"];
    rect(ctx, tx - lw / 2 + sway, ly - lh, lw, lh, colors[tier]);
  });
  // XP orbs floating around tree
  for (let i = 0; i < 5; i++) {
    const angle = t * 0.7 + i * (Math.PI * 2 / 5);
    const r = 20 + i * 5;
    const ox = tx + Math.cos(angle) * r, oy = baseY - treeH * 0.5 + Math.sin(angle) * r * 0.5;
    const a = 0.5 + Math.sin(t * 2 + i) * 0.4;
    ctx.fillStyle = `rgba(110,214,64,${a})`;
    ctx.beginPath(); ctx.arc(f(ox), f(oy), 3, 0, Math.PI * 2); ctx.fill();
  }
};

// 9. LEVEL UP — XP bar + star burst
const drawLevelUp: DrawFn = (ctx, t, w, h) => {
  rect(ctx, 0, 0, w, h, "#07091a");
  // particles
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 + t * 0.4;
    const r = 20 + ((t * 30 + i * 17) % 40);
    const px = w / 2 + Math.cos(angle) * r;
    const py = h / 2 + Math.sin(angle) * r * 0.7;
    const colors = ["#6ED640","#FBBF24","#F472B6","#60A5FA"];
    const a = Math.max(0, 1 - (r - 20) / 40);
    ctx.fillStyle = colors[i % 4].slice(0, 7) + f(a * 255).toString(16).padStart(2, "0");
    ctx.fillRect(f(px) - 2, f(py) - 2, 4, 4);
  }
  // level badge
  const cx = w / 2, cy = h * 0.42;
  ctx.fillStyle = "#0d1a2e";
  ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#FBBF24"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#FBBF24";
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  ctx.fillText("LVL", cx, cy - 4);
  ctx.font = "bold 14px monospace";
  ctx.fillText(String(f(5 + t * 0.2) % 10 + 1 || 1), cx, cy + 10);
  ctx.textAlign = "left";
  // XP bar
  const barW = w * 0.7, barX = w * 0.15, barY = h * 0.72;
  rect(ctx, barX, barY, barW, 10, "#0d1a2e");
  ctx.fillStyle = "#3A9018";
  ctx.fillRect(f(barX), f(barY), f(barX), f(10));
  const xpFill = (Math.sin(t * 0.6) * 0.5 + 0.5) * barW;
  const g = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  g.addColorStop(0, "#6ED640"); g.addColorStop(1, "#FBBF24");
  ctx.fillStyle = g;
  ctx.fillRect(f(barX), f(barY), f(xpFill), 10);
  // label
  ctx.fillStyle = "#6ED640";
  ctx.font = "7px monospace";
  ctx.textAlign = "center";
  ctx.fillText("XP", f(w / 2), f(barY + 22));
  ctx.textAlign = "left";
};

// 10-12. STUDENT BUSTS — pixel person portraits
function drawStudentBust(
  ctx: CanvasRenderingContext2D, t: number, w: number, h: number,
  skinTone: string, hairColor: string, accentColor: string, bgColor: string
) {
  rect(ctx, 0, 0, w, h, bgColor);
  // bokeh bg
  for (let i = 0; i < 12; i++) {
    const bx = (i * 137 + 20) % w, by = (i * 79 + 10) % h;
    const ba = 0.05 + 0.05 * Math.sin(t * 0.8 + i);
    ctx.fillStyle = accentColor + "22";
    ctx.beginPath(); ctx.arc(bx, by, 8 + i % 4, 0, Math.PI * 2); ctx.fill();
  }
  const cx = f(w / 2), cy = f(h * 0.44);
  const ps = Math.max(3, f(w / 22));
  // body/shirt
  const shirtPixels: [number, number][] = [
    [-2,4],[-1,4],[0,4],[1,4],[2,4],
    [-2,5],[-1,5],[0,5],[1,5],[2,5],
    [-3,5],[3,5],
  ];
  shirtPixels.forEach(([px, py]) => {
    rect(ctx, cx + px * ps - ps / 2, cy + py * ps, ps, ps, accentColor);
  });
  // neck
  rect(ctx, cx - ps / 2, cy + 3 * ps, ps, ps, skinTone);
  // head
  const head: [number, number][] = [
    [-1,0],[0,0],[1,0],
    [-1,1],[-1,1],[-1,2],[1,2],
    [-1,-1],[0,-1],[1,-1],
    [-2,0],[-2,1],[2,0],[2,1],
    [-1,2],[0,2],[1,2],
  ];
  head.forEach(([px, py]) => {
    rect(ctx, cx + px * ps - ps / 2, cy + py * ps, ps, ps, skinTone);
  });
  // hair
  const hairPx: [number, number][] = [
    [-1,-2],[0,-2],[1,-2],[-2,-1],[2,-1],
    [-1,-3],[0,-3],[1,-3],
  ];
  hairPx.forEach(([px, py]) => {
    rect(ctx, cx + px * ps - ps / 2, cy + py * ps, ps, ps, hairColor);
  });
  // eyes blink
  const blink = (t % 4) < 3.6;
  if (blink) {
    rect(ctx, cx - ps * 0.8, cy + ps * 0.8, ps * 0.6, ps * 0.6, "#1a1a1a");
    rect(ctx, cx + ps * 0.4, cy + ps * 0.8, ps * 0.6, ps * 0.6, "#1a1a1a");
  }
  // smile
  rect(ctx, cx - ps * 0.5, cy + ps * 1.7, ps, ps * 0.4, "#cc6060");
  // floating sparkles
  for (let i = 0; i < 4; i++) {
    const angle = t * 0.8 + (i * Math.PI) / 2;
    const r = ps * 4.5;
    const sx = cx + Math.cos(angle) * r, sy = cy + Math.sin(angle) * r * 0.6;
    const a = 0.5 + Math.sin(t * 2 + i) * 0.4;
    ctx.fillStyle = `rgba(${parseInt(accentColor.slice(1,3),16)},${parseInt(accentColor.slice(3,5),16)},${parseInt(accentColor.slice(5,7),16)},${a})`;
    ctx.fillRect(f(sx) - 2, f(sy) - 2, 4, 4);
  }
}

const drawStudent1: DrawFn = (ctx, t, w, h) =>
  drawStudentBust(ctx, t, w, h, "#C8956A","#2C1A0E","#A78BFA","#0a0714");
const drawStudent2: DrawFn = (ctx, t, w, h) =>
  drawStudentBust(ctx, t, w, h, "#8D6240","#1A2230","#60A5FA","#070d17");
const drawStudent3: DrawFn = (ctx, t, w, h) =>
  drawStudentBust(ctx, t, w, h, "#F2C89A","#3C1A30","#F472B6","#120a12");

// Scene registry
const SCENES: Record<PixelScene, DrawFn> = {
  code:     drawCode,
  data:     drawData,
  design:   drawDesign,
  product:  drawProduct,
  security: drawSecurity,
  cloud:    drawCloud,
  goal:     drawGoal,
  tree:     drawTree,
  levelup:  drawLevelUp,
  avatar:   drawGoal,    // fallback
  student1: drawStudent1,
  student2: drawStudent2,
  student3: drawStudent3,
};

// ── Animated Canvas ───────────────────────────────────────────────────────────

const PixelBanner: React.FC<{ scene: PixelScene }> = ({ scene }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const t0 = performance.now();
    const drawFn = SCENES[scene] ?? drawCode;

    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      drawFn(ctx, t, canvas.width, canvas.height);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [scene]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={180}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
};

// ── Feature Card ──────────────────────────────────────────────────────────────

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <a
    href={feature.href}
    className="group flex flex-col"
    style={{
      background: "#0d1a2e",
      border: "3px solid #1e3858",
      boxShadow: "4px 4px 0 #0a1222, 6px 6px 0 rgba(0,0,0,0.4)",
      transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
      outline: "none",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLAnchorElement).style.transform = "translate(-2px,-3px)";
      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "6px 7px 0 #0a1222, 8px 9px 0 rgba(0,0,0,0.4)";
      (e.currentTarget as HTMLAnchorElement).style.borderColor = "#6ed640";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLAnchorElement).style.transform = "";
      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "4px 4px 0 #0a1222, 6px 6px 0 rgba(0,0,0,0.4)";
      (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e3858";
    }}
  >
    {/* Pixel art banner */}
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <PixelBanner scene={feature.pixelScene} />
      {/* scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {feature.isNew && (
        <span
          className="absolute top-2 right-2 px-2 py-1 font-bold z-20"
          style={{
            background: "#b87209",
            color: "#fff",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "7px",
            border: "2px solid #7a4a00",
            boxShadow: "2px 2px 0 #3a2000",
          }}
        >
          NEW!
        </span>
      )}
    </div>

    {/* Pixel divider */}
    <div style={{ height: "3px", background: "repeating-linear-gradient(90deg, #1e3858 0px, #1e3858 6px, #0a1222 6px, #0a1222 8px)" }} />

    {/* Body */}
    <div className="flex flex-col flex-1 p-4 gap-2">
      {feature.label && (
        <p
          className="text-[#6ed640]"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px", letterSpacing: "0.12em" }}
        >
          ▸ {feature.label}
        </p>
      )}
      <h3 className="text-white font-bold leading-snug" style={{ fontSize: "14px" }}>
        {feature.title}
      </h3>
      <p
        className="text-[#7a8fa8] text-sm leading-relaxed flex-1"
        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {feature.description}
      </p>
      {feature.badge && (
        <div className="mt-2">
          <span
            className="inline-flex items-center gap-2 px-2 py-1 text-[#7a8fa8]"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "7px",
              background: "#060e1a",
              border: "2px solid #1e3858",
              boxShadow: "2px 2px 0 #030810",
            }}
          >
            <svg width="9" height="9" viewBox="0 0 11 11" fill="none" aria-hidden>
              <rect x="0" y="7" width="2" height="4" fill="currentColor" opacity="0.35" />
              <rect x="3" y="4.5" width="2" height="6.5" fill="currentColor" opacity="0.55" />
              <rect x="6" y="2" width="2" height="9" fill="currentColor" opacity="0.75" />
              <rect x="9" y="0" width="2" height="11" fill="currentColor" />
            </svg>
            {feature.badge}
          </span>
        </div>
      )}
    </div>
  </a>
);

// ── Feature Grid ──────────────────────────────────────────────────────────────

const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  ({ features, className }, ref) => {
    if (!features || features.length === 0) return null;
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>
    );
  }
);
FeatureGrid.displayName = "FeatureGrid";

export { FeatureGrid };
