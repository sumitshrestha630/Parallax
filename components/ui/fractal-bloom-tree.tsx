"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FractalBloomCanvasProps {
  className?: string;
}

export const FractalBloomCanvas = ({ className }: FractalBloomCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: (container?.clientWidth ?? window.innerWidth) / 2, y: container?.clientHeight ?? window.innerHeight };
    let currentDepth = 0;
    const maxDepth = 9;

    const resizeCanvas = () => {
      canvas.width  = container?.clientWidth  ?? window.innerWidth;
      canvas.height = container?.clientHeight ?? window.innerHeight;
      mouse.x = canvas.width / 2;
      mouse.y = canvas.height;
    };

    const drawBranch = (x: number, y: number, angle: number, length: number, depth: number) => {
      if (depth > currentDepth) return;

      ctx.beginPath();
      ctx.moveTo(x, y);

      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      ctx.lineTo(endX, endY);

      const opacity = 1 - depth / maxDepth;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
      ctx.lineWidth = 1 - (depth / maxDepth) * 0.5;
      ctx.stroke();

      const distToMouse = Math.hypot(endX - mouse.x, endY - mouse.y);
      const mouseEffect = Math.max(0, 1 - distToMouse / (canvas.height / 2));
      const angleOffset = (Math.PI / 8) * mouseEffect;

      drawBranch(endX, endY, angle - Math.PI / 10 - angleOffset, length * 0.8, depth + 1);
      drawBranch(endX, endY, angle + Math.PI / 10 + angleOffset, length * 0.8, depth + 1);
    };

    const animate = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const startX      = canvas.width / 2;
      const startY      = canvas.height;
      const startLength = canvas.height / 5;

      drawBranch(startX, startY, -Math.PI / 2, startLength, 0);

      if (currentDepth < maxDepth) currentDepth += 0.03;

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const ro = new ResizeObserver(resizeCanvas);
    if (container) ro.observe(container);
    canvas.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full bg-[#020617]", className)}
    />
  );
};
