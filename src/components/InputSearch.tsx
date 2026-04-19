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
      className="panel-surface-strong interactive-surface-strong console-shell relative overflow-hidden rounded-[1.65rem] p-4 sm:p-5 lg:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
      <div className="absolute -right-20 top-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Search className="h-3.5 w-3.5 text-accent" />
            Search Console
          </div>

          <div className="max-w-2xl">
            <p className="text-sm leading-6 text-foreground/92 sm:text-[15px]">
              Найдите статус по коду или по словам из описания и действий. Точный код
              отрабатывает как рабочая команда, текстовый запрос помогает быстро
              сузить выдачу по смыслу.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-[11px] text-muted-foreground lg:flex">
          <Slash className="h-3.5 w-3.5" />
          Быстрый фокус
        </div>
      </div>

      <div className="mt-4 relative">
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-xl border border-border/60 bg-background/55 p-2 text-muted-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.04)]">
          <Search className="h-4 w-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Например: PAP, приемка, сортировка, переупаковка"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit?.();
            if (event.key === "Escape") onClear();
          }}
          className="h-14 w-full rounded-[1.25rem] border border-border/75 bg-background/72 px-16 py-4 pr-32 text-[15px] text-foreground shadow-[0_12px_36px_hsl(243_48%_4%_/_0.22),inset_0_1px_0_hsl(0_0%_100%_/_0.04)] transition-all placeholder:text-muted-foreground focus-visible:border-accent/45 focus-visible:bg-background/92 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/12 sm:h-16 sm:text-base"
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <div className="hidden items-center gap-1 rounded-xl border border-border/65 bg-background/72 px-2.5 py-1.5 text-[11px] text-muted-foreground md:flex">
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
                className="action-chip h-9 w-9 justify-center rounded-xl p-0"
                aria-label="Очистить поиск"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-[11px] text-muted-foreground sm:grid-cols-3">
        <div className="content-panel rounded-2xl px-3 py-2.5">
          Коды: точный поиск и префикс
        </div>
        <div className="content-panel rounded-2xl px-3 py-2.5">
          Текст: поиск по словам
        </div>
        <div className="content-panel rounded-2xl px-3 py-2.5">
          Esc: очистить запрос
        </div>
      </div>
    </motion.section>
  );
};

export default InputSearch;
