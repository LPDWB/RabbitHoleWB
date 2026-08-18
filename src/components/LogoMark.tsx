"use client";

import React from "react";
import { motion } from "framer-motion";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Orbital Rings */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_0_12px_rgba(66,133,244,0.4)]"
      >
        {/* Antigravity Gravitational Torus / Orbit 1 */}
        <motion.ellipse
          cx="20"
          cy="20"
          rx="17"
          ry="7"
          stroke="url(#google-antigravity-grad1)"
          strokeWidth="2.2"
          strokeDasharray="4 2"
          transform="rotate(-25 20 20)"
          animate={{ rotate: [-25, 335] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbit 2 */}
        <motion.ellipse
          cx="20"
          cy="20"
          rx="17"
          ry="7"
          stroke="url(#google-antigravity-grad2)"
          strokeWidth="2"
          transform="rotate(35 20 20)"
          animate={{ rotate: [35, -325] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Central Quantum Singularity Sphere */}
        <circle cx="20" cy="20" r="5.5" fill="url(#core-grad)" />
        <circle cx="18.5" cy="18.5" r="1.8" fill="#ffffff" opacity="0.85" />

        {/* Google 4-Color Gradients */}
        <defs>
          <linearGradient id="google-antigravity-grad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="35%" stopColor="#EA4335" />
            <stop offset="70%" stopColor="#FBBC05" />
            <stop offset="100%" stopColor="#34A853" />
          </linearGradient>

          <linearGradient id="google-antigravity-grad2" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#4285F4" />
            <stop offset="100%" stopColor="#34A853" />
          </linearGradient>

          <radialGradient id="core-grad" cx="20" cy="20" r="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#8AB4F8" />
            <stop offset="70%" stopColor="#4285F4" />
            <stop offset="100%" stopColor="#1A73E8" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export default LogoMark;
