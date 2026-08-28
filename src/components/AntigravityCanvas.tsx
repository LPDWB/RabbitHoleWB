"use client";

import React from "react";

interface Props {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

/**
 * Clean static ambient background container for high-tech Dark Neon & Glassmorphism theme.
 * Kept static and solid to avoid visual noise and battery drain.
 */
export function AntigravityCanvas({ className = "" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      {/* Subtle, static matte ambient radial lights */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-fuchsia-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -left-32 h-[400px] w-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 h-[450px] w-[600px] rounded-full bg-pink-600/5 blur-[140px] pointer-events-none" />
    </div>
  );
}

export default AntigravityCanvas;
