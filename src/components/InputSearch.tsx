"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search, Slash, X } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface Props {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
}

const InputSearch: React.FC<Props> = ({ query, onChange, onClear, onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSlashFocus = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTextField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (!isTextField && event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleSlashFocus);
    return () => window.removeEventListener("keydown", handleSlashFocus);
  }, []);

  return (
    <motion.section
      data-glow="strong"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="panel-surface-strong console-shell relative rounded-[1.65rem] px-4 py-4 sm:px-5 sm:py-5 lg:px-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Поиск
          </p>
          <p className="text-sm text-muted-foreground sm:text-[15px]">
            Введите статус или краткое описание статуса.
          </p>
        </div>

        <div className="hidden items-center gap-1 rounded-full bg-background/30 px-2.5 py-1 text-[11px] text-muted-foreground md:flex">
          <Slash className="h-3.5 w-3.5" />
          Фокус
        </div>
      </div>

      <div className="mt-4 rounded-[1.35rem] border border-white/[0.04] bg-black/10 p-2.5 shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.03)]">
        <div className="relative rounded-[1.1rem] bg-background/34 shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.04)] transition-colors focus-within:bg-background/42">
          <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Например: PAP, приемка, сортировка"
            value={query}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSubmit?.();
              if (event.key === "Escape") onClear();
            }}
            className="h-14 w-full rounded-[1.1rem] border border-transparent bg-transparent px-12 py-4 pr-28 text-[15px] text-foreground placeholder:text-muted-foreground/80 focus-visible:border-accent/18 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/8 sm:h-16 sm:text-base"
          />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <div className="hidden items-center gap-1 rounded-lg bg-background/42 px-2 py-1 text-[11px] text-muted-foreground md:flex">
              <CornerDownLeft className="h-3 w-3" />
              Enter
            </div>

            <AnimatePresence initial={false}>
              {query && (
                <motion.button
                  key="clear"
                  data-glow="action"
                  type="button"
                  onClick={onClear}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="action-chip h-9 w-9 justify-center rounded-lg p-0"
                  aria-label="Очистить поиск"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/88">
        <span>/ фокус</span>
        <span>Esc очистить</span>
      </div>
    </motion.section>
  );
};

export default InputSearch;
