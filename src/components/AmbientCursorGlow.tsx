"use client";

import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type GlowPreset = {
  opacity: number;
  scale: number;
};

const GLOW_PRESETS: Record<string, GlowPreset> = {
  idle: { opacity: 0.18, scale: 1 },
  base: { opacity: 0.24, scale: 1.02 },
  strong: { opacity: 0.3, scale: 1.05 },
  action: { opacity: 0.2, scale: 0.96 },
};

type AmbientCursorGlowProps = {
  children: React.ReactNode;
  className?: string;
};

export function AmbientCursorGlow({ children, className }: AmbientCursorGlowProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  const pointerRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    currentOpacity: 0,
    targetOpacity: 0,
    currentScale: 1,
    targetScale: 1,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncCapability = () => {
      setEnabled(finePointerQuery.matches && !reducedMotionQuery.matches);
    };

    syncCapability();

    reducedMotionQuery.addEventListener("change", syncCapability);
    finePointerQuery.addEventListener("change", syncCapability);

    return () => {
      reducedMotionQuery.removeEventListener("change", syncCapability);
      finePointerQuery.removeEventListener("change", syncCapability);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (!enabled) {
      stage.style.setProperty("--glow-opacity", "0");
      return;
    }

    const setPreset = (presetName?: string) => {
      const preset = GLOW_PRESETS[presetName ?? "idle"] ?? GLOW_PRESETS.idle;
      pointerRef.current.targetOpacity = preset.opacity;
      pointerRef.current.targetScale = preset.scale;
    };

    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      pointerRef.current.targetX = event.clientX;
      pointerRef.current.targetY = event.clientY;

      if (pointerRef.current.currentX === 0 && pointerRef.current.currentY === 0) {
        pointerRef.current.currentX = event.clientX;
        pointerRef.current.currentY = event.clientY;
      }

      const zone = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-glow]");
      setPreset(zone?.dataset.glow);
    };

    const handlePointerLeave = () => {
      pointerRef.current.targetOpacity = 0;
      pointerRef.current.targetScale = 1;
    };

    const handleWindowBlur = () => {
      pointerRef.current.targetOpacity = 0;
    };

    const animate = () => {
      const pointer = pointerRef.current;

      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.12;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.12;
      pointer.currentOpacity += (pointer.targetOpacity - pointer.currentOpacity) * 0.08;
      pointer.currentScale += (pointer.targetScale - pointer.currentScale) * 0.1;

      stage.style.setProperty("--glow-x", `${pointer.currentX}px`);
      stage.style.setProperty("--glow-y", `${pointer.currentY}px`);
      stage.style.setProperty("--glow-opacity", pointer.currentOpacity.toFixed(3));
      stage.style.setProperty("--glow-scale", pointer.currentScale.toFixed(3));

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handleWindowBlur);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled]);

  return (
    <div ref={stageRef} className={cn("glow-stage", className)}>
      <div className="glow-overlay-fixed" aria-hidden="true">
        <div className="glow-orb" />
        <div className="glow-orb glow-orb-secondary" />
      </div>
      <div className="glow-content">{children}</div>
    </div>
  );
}

export default AmbientCursorGlow;
