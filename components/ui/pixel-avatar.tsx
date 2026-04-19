"use client";

import React, { useEffect, useRef } from "react";

export const AW = 32, AH = 40;

export interface AvatarDef {
  id: string; label: string; bg: string;
  skin: string; hair: string; outfit: string; accent: string;
}

export const AVATARS: AvatarDef[] = [
  { id: "coder",     label: "The Coder",     bg: "#0a1428", skin: "#E8B88A", hair: "#2A1A0A", outfit: "#2850A0", accent: "#60A5FA" },
  { id: "explorer",  label: "The Explorer",  bg: "#081a08", skin: "#C8956A", hair: "#4A2A0E", outfit: "#2A5A28", accent: "#6ED640" },
  { id: "wizard",    label: "The Wizard",    bg: "#10082a", skin: "#D4A87A", hair: "#F0E8C0", outfit: "#5828A0", accent: "#A78BFA" },
  { id: "knight",    label: "The Knight",    bg: "#101418", skin: "#E0C8A8", hair: "#3A2A1A", outfit: "#4A5060", accent: "#94a3b8" },
  { id: "artist",    label: "The Artist",    bg: "#1a0c06", skin: "#F0C8A0", hair: "#C84060", outfit: "#B84018", accent: "#FB923C" },
  { id: "scientist", label: "The Scientist", bg: "#061820", skin: "#C8D8C4", hair: "#4A5470", outfit: "#D0E4F0", accent: "#22D3EE" },
];

function hex2rgba(c: string, a: number) {
  const v = parseInt(c.slice(1), 16);
  return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`;
}

export function drawAvatar(ctx: CanvasRenderingContext2D, def: AvatarDef, t: number) {
  const { skin, hair, outfit, accent, bg, id } = def;
  const cx = AW / 2;
  const blink = Math.sin(t * 0.4) > 0.96;

  ctx.clearRect(0, 0, AW, AH);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, AW, AH);

  const gl = ctx.createRadialGradient(cx, 22, 2, cx, 22, 16);
  gl.addColorStop(0, hex2rgba(accent, 0.15)); gl.addColorStop(1, hex2rgba(accent, 0));
  ctx.fillStyle = gl; ctx.fillRect(0, 0, AW, AH);

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  for (let y = 0; y < AH; y += 2) ctx.fillRect(0, y, AW, 1);

  // Body
  ctx.fillStyle = outfit; ctx.fillRect(6, 26, 20, 14);
  ctx.fillStyle = skin;   ctx.fillRect(13, 24, 6, 4);

  if (id === "coder") {
    ctx.fillStyle = hex2rgba(accent, 0.6); ctx.fillRect(9, 32, 14, 8);
    ctx.fillStyle = hex2rgba(accent, 0.9); ctx.fillRect(10, 33, 12, 6);
    ctx.fillStyle = hex2rgba(accent, 0.3); ctx.fillRect(6, 26, 2, 8); ctx.fillRect(24, 26, 2, 8);
  } else if (id === "explorer") {
    ctx.fillStyle = "#6A3E1A"; ctx.fillRect(6, 27, 3, 10); ctx.fillRect(23, 27, 3, 10);
    ctx.fillStyle = accent;    ctx.fillRect(13, 34, 6, 2);
  } else if (id === "wizard") {
    ctx.fillStyle = accent;              ctx.fillRect(14, 29, 4, 4);
    ctx.fillStyle = hex2rgba(accent, 0.5); ctx.fillRect(13, 28, 6, 6);
    const sa = 0.5 + Math.sin(t * 2.1) * 0.4;
    ctx.fillStyle = hex2rgba(accent, sa); ctx.fillRect(10, 31, 2, 2); ctx.fillRect(20, 33, 2, 2);
  } else if (id === "knight") {
    ctx.fillStyle = "#606878"; ctx.fillRect(8, 26, 6, 12); ctx.fillRect(18, 26, 6, 12);
    ctx.fillStyle = "#80909A"; ctx.fillRect(9, 27, 4, 4); ctx.fillRect(19, 27, 4, 4);
    const ka = 0.4 + Math.sin(t * 1.5) * 0.2;
    ctx.fillStyle = hex2rgba(accent, ka); ctx.fillRect(22, 30, 4, 6);
  } else if (id === "artist") {
    [["#E040C0", 9, 29], ["#40C0E0", 15, 32], ["#E0C040", 21, 28], ["#C040E0", 12, 36], ["#40E080", 20, 34]]
      .forEach(([c, dx, dy]) => { ctx.fillStyle = c as string; ctx.fillRect(dx as number, dy as number, 2, 2); });
    ctx.fillStyle = "#8B5E3C"; ctx.fillRect(24, 28, 2, 10);
    ctx.fillStyle = accent;    ctx.fillRect(24, 36, 2, 3);
  } else if (id === "scientist") {
    ctx.fillStyle = "#E8F4FC"; ctx.fillRect(8, 26, 4, 10); ctx.fillRect(20, 26, 4, 10);
    ctx.fillStyle = hex2rgba(accent, 0.8); ctx.fillRect(23, 30, 4, 6);
    ctx.fillStyle = hex2rgba(accent, 0.6 + Math.sin(t * 3) * 0.3); ctx.fillRect(24, 29, 2, 2);
  }

  // Head
  ctx.fillStyle = skin;
  ctx.fillRect(9, 10, 14, 16); ctx.fillRect(10, 25, 12, 1); ctx.fillRect(11, 26, 10, 1);
  ctx.fillStyle = hex2rgba("#FF8888", 0.18);
  ctx.fillRect(10, 17, 2, 3); ctx.fillRect(20, 17, 2, 3);

  // Eyes
  ctx.fillStyle = blink ? skin : "#1A1008";
  ctx.fillRect(12, 15, 2, blink ? 1 : 2); ctx.fillRect(18, 15, 2, blink ? 1 : 2);
  if (!blink) {
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(13, 15, 1, 1); ctx.fillRect(19, 15, 1, 1);
  }

  // Mouth / nose
  const ms = Math.sin(t * 0.3) > 0.8;
  ctx.fillStyle = hex2rgba("#8B4A2A", 0.9); ctx.fillRect(14, 20, 4, 1);
  if (ms) { ctx.fillRect(13, 19, 2, 1); ctx.fillRect(17, 19, 2, 1); }
  ctx.fillStyle = hex2rgba("#B07040", 0.4); ctx.fillRect(15, 18, 2, 1);

  // Hair / headwear
  if (id === "wizard") {
    ctx.fillStyle = outfit;
    for (let i = 0; i < 8; i++) ctx.fillRect(cx - i + 4, 2 + i, i * 2 - 8, 1);
    ctx.fillRect(7, 10, 18, 3); ctx.fillRect(8, 12, 16, 1);
    ctx.fillStyle = hex2rgba(accent, 0.7 + Math.sin(t * 2.4) * 0.3); ctx.fillRect(15, 4, 2, 2);
  } else if (id === "knight") {
    ctx.fillStyle = "#5A6270";
    ctx.fillRect(8, 8, 16, 9); ctx.fillRect(7, 10, 2, 12); ctx.fillRect(23, 10, 2, 12);
    ctx.fillStyle = "#6A7280"; ctx.fillRect(9, 9, 14, 3);
    ctx.fillStyle = hex2rgba(accent, 0.25); ctx.fillRect(9, 12, 14, 2);
  } else if (id === "artist") {
    ctx.fillStyle = accent;
    ctx.fillRect(8, 7, 16, 5); ctx.fillRect(9, 5, 14, 4); ctx.fillRect(11, 3, 10, 4);
    ctx.fillStyle = hex2rgba("#FFFFFF", 0.6); ctx.fillRect(20, 5, 3, 3);
    ctx.fillStyle = hair;
    ctx.fillRect(8, 12, 2, 12); ctx.fillRect(22, 12, 2, 12); ctx.fillRect(7, 14, 2, 8); ctx.fillRect(23, 14, 2, 6);
  } else {
    ctx.fillStyle = hair;
    ctx.fillRect(9, 8, 14, 4); ctx.fillRect(8, 9, 2, 10); ctx.fillRect(22, 9, 2, 8);
    if (id === "explorer") {
      ctx.fillStyle = "#6A3E1A";
      ctx.fillRect(7, 8, 18, 2); ctx.fillRect(8, 6, 16, 4); ctx.fillRect(9, 4, 14, 4);
    } else if (id === "scientist") {
      ctx.fillStyle = hex2rgba(accent, 0.7);
      ctx.fillRect(11, 15, 4, 3); ctx.fillRect(17, 15, 4, 3);
      ctx.fillRect(15, 16, 2, 1); ctx.fillRect(10, 15, 1, 3); ctx.fillRect(21, 15, 1, 3);
    } else if (id === "coder") {
      ctx.fillStyle = hex2rgba(accent, 0.8);
      ctx.fillRect(8, 11, 2, 5); ctx.fillRect(22, 11, 2, 5);
      ctx.fillStyle = hex2rgba(accent, 0.5); ctx.fillRect(8, 8, 16, 2);
    }
  }
}

interface PixelAvatarProps {
  avatarId: string;
  /** Display width in px (height is auto-proportional) */
  size?: number;
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PixelAvatar({ avatarId, size = 112, selected = false, className, style }: PixelAvatarProps) {
  const ref  = useRef<HTMLCanvasElement>(null);
  const def  = AVATARS.find(a => a.id === avatarId);

  useEffect(() => {
    if (!def) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const t0 = performance.now(); let raf: number;
    const loop = () => { drawAvatar(ctx, def, (performance.now() - t0) / 1000); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [def]);

  if (!def) return null;
  const h = Math.round(size * (AH / AW));

  return (
    <canvas ref={ref} width={AW} height={AH} className={className}
      style={{ width: size, height: h, imageRendering: "pixelated", display: "block",
        filter: selected ? "brightness(1.15)" : "brightness(1)", ...style }} />
  );
}
