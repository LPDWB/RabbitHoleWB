"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useAntigravity } from "@/components/AntigravityContext";

export interface WMSStatus {
  id: string;
  code: string;
  codes?: string[];
  category: string;
  description: string;
  action: string;
  badgeType?: "blue" | "yellow" | "purple" | "cyan" | "green" | "red";
  priority?: "high" | "normal" | "low";
  count?: number;
}

interface Props {
  status: WMSStatus;
  index: number;
}

export function StatusCard({ status, index }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const { hapticPulse } = useAntigravity();

  const codes = status.codes && status.codes.length > 0 ? status.codes : [status.code];
  const isGrouped = codes.length > 1;

  const handleCopyCode = async (e: React.MouseEvent, codeToCopy: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopiedCode(codeToCopy);
      hapticPulse(1.5);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyFull = async () => {
    try {
      const codeLabel = isGrouped ? `Статусы: ${codes.join(", ")}` : `Статус: ${codes[0]}`;
      const text = `[WMS ${codeLabel}] ${status.category}\nНазвание: ${status.description}\nРегламент ТСД: ${status.action}`;
      await navigator.clipboard.writeText(text);
      setCopiedFull(true);
      hapticPulse(2);
      setTimeout(() => setCopiedFull(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
      className="group relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-fuchsia-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.36)] hover:shadow-[0_0_25px_rgba(217,70,239,0.12)]"
    >
      <div>
        {/* Card Top: Status Code(s) + Category Chip */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Codes */}
          <div className="flex flex-wrap items-center gap-2">
            {codes.map((code) => {
              const isCopied = copiedCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={(e) => handleCopyCode(e, code)}
                  className={`group/code relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1 bg-white/[0.04] border transition-all duration-200 hover:border-fuchsia-500/60 active:scale-95 ${
                    isCopied
                      ? "border-emerald-500/80 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 text-zinc-100"
                  }`}
                  title={`Нажмите, чтобы скопировать #${code}`}
                >
                  <span className="font-mono font-black text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent group-hover/code:brightness-125">
                    #{code}
                  </span>

                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-zinc-400 group-hover/code:text-fuchsia-300 transition-colors ml-1">
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </div>

                  {isCopied && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-sans font-bold text-white shadow-lg animate-in fade-in zoom-in-95 z-20 whitespace-nowrap">
                      Скопировано!
                    </span>
                  )}
                </button>
              );
            })}

            {isGrouped && (
              <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-fuchsia-300">
                <Layers className="h-3 w-3" />
                {codes.length} в группе
              </span>
            )}
          </div>

          {/* Category Chip */}
          {status.category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/10 px-2.5 py-1 text-xs font-mono font-medium text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              {status.category}
            </span>
          )}
        </div>

        {/* Operation Title / Description */}
        <div className="mt-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400/80 font-medium">
            Операция
          </span>
          <p className="mt-1 text-sm sm:text-[15px] font-medium leading-snug text-zinc-100">
            {status.description}
          </p>
        </div>

        {/* Action / Regulation Terminal Block */}
        <div className="mt-4 rounded-xl bg-black/50 border border-white/[0.08] p-3.5 backdrop-blur-sm group-hover:border-white/[0.14] transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-fuchsia-400 tracking-wide uppercase">
            <Terminal className="h-3.5 w-3.5" />
            <span>&gt;_ РЕГЛАМЕНТ ТСД</span>
          </div>
          <p className="mt-1.5 font-mono text-xs sm:text-[13px] text-zinc-300/90 leading-relaxed">
            {status.action}
          </p>
        </div>
      </div>

      {/* Full Width Copy Button at bottom */}
      <button
        type="button"
        onClick={handleCopyFull}
        className="mt-5 w-full rounded-xl py-2.5 px-4 bg-white/[0.04] hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-violet-600 text-zinc-200 hover:text-white border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(217,70,239,0.3)] active:scale-[0.99]"
      >
        {copiedFull ? (
          <>
            <Check className="h-4 w-4 text-emerald-300" />
            <span className="text-emerald-300 font-semibold">Регламент скопирован в буфер</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
            <span>Копировать {isGrouped ? "регламент группы" : `статус #${codes[0]}`}</span>
          </>
        )}
      </button>
    </motion.div>
  );
}

export default StatusCard;
