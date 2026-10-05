"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

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
}

export function StatusCard({ status }: Props) {
  const [copied, setCopied] = useState(false);
  const codes = status.codes && status.codes.length > 0 ? status.codes : [status.code];

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const codeStr = codes.map((c) => `#${c}`).join(" ");
      const textToCopy = `${codeStr}\nОперация: ${status.description}\nРегламент: ${status.action}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="group rounded-xl bg-[#14121d] border border-zinc-800/80 hover:border-fuchsia-500/60 p-4 transition-colors flex flex-col justify-between h-full">
      <div>
        {/* Top Header: Large Accent Tag #ID + Single Compact Copy Icon on Left, Category Badge on Right */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {codes.map((code) => (
              <span
                key={code}
                className="font-mono text-xl sm:text-2xl font-black text-fuchsia-400 tracking-tight"
              >
                #{code}
              </span>
            ))}
            <button
              type="button"
              onClick={handleCopy}
              title="Копировать статус и регламент"
              className="p-1 rounded text-zinc-500 hover:text-fuchsia-400 opacity-60 group-hover:opacity-100 transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {status.category && (
            <span className="text-[11px] font-mono border border-zinc-700/60 text-zinc-400 rounded px-2 py-0.5 whitespace-nowrap shrink-0">
              {status.category}
            </span>
          )}
        </div>

        {/* Operation Description */}
        <p className="text-sm font-medium text-zinc-200 mb-2 leading-snug">
          {status.description}
        </p>

        {/* Regulation / Action Paragraph (no inner dark blocks, no borders/wrappers, text-zinc-400) */}
        <p className="text-xs text-zinc-400 leading-relaxed font-mono">
          {status.action}
        </p>
      </div>
    </div>
  );
}

export default StatusCard;
