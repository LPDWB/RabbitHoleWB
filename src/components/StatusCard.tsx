"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { useAntigravity } from "@/components/AntigravityContext";


export interface WMSStatus {
  id: string;
  code: string;
  category: string;
  description: string;
  action: string;
  badgeType?: "blue" | "yellow" | "purple" | "cyan" | "green" | "red";
  priority?: "high" | "normal" | "low";
}

interface Props {
  status: WMSStatus;
  index: number;
}

export function StatusCard({ status, index }: Props) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const { zeroG, hapticPulse } = useAntigravity();

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(status.code);
      setCopiedCode(true);
      hapticPulse(1.5);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyFull = async () => {
    try {
      const text = `[WMS Статус ${status.code}] ${status.category}\nОписание: ${status.description}\nДействие ТСД: ${status.action}`;
      await navigator.clipboard.writeText(text);
      setCopiedFull(true);
      hapticPulse(2);
      setTimeout(() => setCopiedFull(false), 2000);
    } catch {
      // fallback
    }
  };

  const getBadgeClass = (category: string) => {
    if (category.includes("Брак")) return "badge-red";
    if (category.includes("Отгруз")) return "badge-green";
    if (category.includes("Сбор") || category.includes("Возврат")) return "badge-yellow";
    if (category.includes("Упаков") || category.includes("Инвент")) return "badge-purple";
    if (category.includes("Сортиров") || category.includes("Хран")) return "badge-cyan";
    return "badge-blue";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className={`group relative flex flex-col justify-between rounded-3xl p-6 antigravity-card ${
        zeroG ? "antigravity-floating" : ""
      }`}
      style={{
        animationDelay: `${(index % 5) * 0.7}s`,
      }}
    >
      {/* Top Laser Accent on Hover */}
      <div className="absolute inset-x-8 top-0 h-[2px] opacity-0 group-hover:opacity-100 google-laser-gradient transition-opacity duration-300 rounded-full" />

      <div>
        {/* Card Header: Code Badge + Category */}
        <div className="flex items-center justify-between gap-3">
          {/* Monospace Code Pill with copy action */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="group/code relative flex items-center gap-2 rounded-2xl bg-card px-3.5 py-1.5 border border-border/80 text-foreground font-mono font-bold text-lg sm:text-xl transition-all hover:border-primary hover:shadow-[0_0_15px_rgba(66,133,244,0.3)] active:scale-95"
            title="Нажмите, чтобы скопировать код"
          >
            <span className="text-primary font-mono">#</span>
            <span>{status.code}</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary opacity-60 group-hover/code:opacity-100 transition-opacity">
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </div>

            {copiedCode && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-sans font-bold text-white shadow-md animate-in fade-in zoom-in-95">
                Скопировано!
              </span>
            )}
          </button>

          {/* Category Chip */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${getBadgeClass(status.category)}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            {status.category}
          </span>
        </div>

        {/* Description Section */}
        <div className="mt-5">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Описание операции
          </h3>
          <p className="mt-1.5 text-sm sm:text-[15px] font-normal leading-relaxed text-foreground/90">
            {status.description}
          </p>
        </div>

        {/* Action / Procedure Section */}
        <div className="mt-4 rounded-2xl bg-background/50 border border-border/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-primary">
            <Terminal className="h-3.5 w-3.5" />
            <span>Регламент ТСД / Действие:</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {status.action}
          </p>
        </div>
      </div>

      {/* Card Footer: Fast Copy & Telemetry */}
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-border/40">
        <span className="text-[11px] font-mono text-muted-foreground/60">
          ID: {status.id}
        </span>

        <button
          type="button"
          onClick={handleCopyFull}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {copiedFull ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Регламент скопирован</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Копировать всё</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default StatusCard;
