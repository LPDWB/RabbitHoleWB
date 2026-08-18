"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useAntigravity } from "@/components/AntigravityContext";


interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  totalMatches?: number;
}

export function InputSearch({
  value,
  onChange,
  placeholder = "Введите название операции (напр. Приемка, Сборка, Подмена) или статус (AIP, ASP, WIJ)...",
  totalMatches,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { hapticPulse } = useAntigravity();

  // Keyboard shortcut '/' and 'Escape'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        hapticPulse(1);
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        if (value) {
          onChange("");
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, onChange, hapticPulse]);

  return (
    <div className="relative w-full max-w-3xl mx-auto group">
      {/* Outer Floating Glow Aura */}
      <div className="absolute -inset-1 rounded-full google-laser-gradient opacity-20 blur-xl group-hover:opacity-40 group-focus-within:opacity-75 transition-all duration-500" />

      {/* Main Capsule Search Bar */}
      <div className="antigravity-search-bar relative flex items-center gap-3 rounded-full px-5 py-3.5 shadow-2xl transition-all">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search className="h-4 w-4 transition-transform group-hover:scale-110 group-focus-within:text-primary" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            hapticPulse(0.3);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />

        {/* Dynamic Match Count Indicator */}
        {value && totalMatches !== undefined && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-xs font-mono font-medium text-primary border border-primary/20">
            {totalMatches} {totalMatches === 1 ? "совпадение" : totalMatches > 1 && totalMatches < 5 ? "совпадения" : "найдено"}
          </span>
        )}

        {/* Clear Button */}
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
              hapticPulse(0.8);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-card hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-all"
            title="Очистить"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground/60 border border-border/80 rounded-lg px-2 py-0.5 bg-card/40">
            <kbd>/</kbd>
          </div>
        )}
      </div>
    </div>
  );
}

export default InputSearch;
