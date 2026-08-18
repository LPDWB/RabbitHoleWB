"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseAngle: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
}

const GOOGLE_COLORS = [
  "rgba(66, 133, 244, ",  // Google Blue
  "rgba(234, 67, 53, ",   // Google Red
  "rgba(251, 188, 5, ",   // Google Yellow
  "rgba(52, 168, 83, ",   // Google Green
  "rgba(138, 180, 248, ", // Light Blue
  "rgba(197, 138, 249, ", // DeepMind Violet
  "rgba(120, 217, 236, ", // Cyan Quantum
];

interface Props {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

export function AntigravityCanvas({
  className = "",
  particleCount = 55,
  interactive = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    active: boolean;
    radius: number;
    force: number;
  }>({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    radius: 220,
    force: 0.8,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Initialize particles with antigravity zero-G parameters
    const particles: Particle[] = [];
    const count = Math.min(particleCount, Math.floor((width * height) / 18000));

    for (let i = 0; i < count; i++) {
      const colorPrefix = GOOGLE_COLORS[Math.floor(Math.random() * GOOGLE_COLORS.length)];
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 3.2 + 1.2,
        color: colorPrefix,
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 40 + 10,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    if (interactive) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave);
    }

    // Render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Draw subtle orbital gravitational field around cursor
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        gradient.addColorStop(0, "rgba(66, 133, 244, 0.08)");
        gradient.addColorStop(0.5, "rgba(197, 138, 249, 0.04)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw particle connections (Antigravity quantum filaments)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.strokeStyle = `rgba(138, 180, 248, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Antigravity drift
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        // Subtle zero-G oscillation
        p.orbitAngle += p.orbitSpeed * delta;
        p.pulseAngle += p.pulseSpeed * delta;
        p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.15;

        // Mouse Antigravity interaction (gravity repulsion / orbital deflection)
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 1) {
            const force = (1 - dist / mouse.radius) * mouse.force;
            const angle = Math.atan2(dy, dx);
            // Repulsion + subtle tangential spin (antigravity vortex)
            p.vx += (Math.cos(angle) * force * 0.4 + Math.sin(angle) * force * 0.15) * delta;
            p.vy += (Math.sin(angle) * force * 0.4 - Math.cos(angle) * force * 0.15) * delta;
          }
        }

        // Friction damping to maintain weightless velocity
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Ensure minimum zero-G float
        if (Math.abs(p.vx) < 0.15) p.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(p.vy) < 0.15) p.vy += (Math.random() - 0.5) * 0.1;

        // Screen wrap-around for endless cosmos
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Render glowing particle
        ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(0.9, p.alpha))})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra quantum core glow for larger particles
        if (p.size > 2.2) {
          ctx.fillStyle = `${p.color}${p.alpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70 transition-opacity duration-1000 ${className}`}
    />
  );
}
export default AntigravityCanvas;
