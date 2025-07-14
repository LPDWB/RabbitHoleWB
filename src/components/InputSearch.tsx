"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";

interface Props {
  query: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

const InputSearch: React.FC<Props> = ({ query, onChange, onClear }) => {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none"
      animate={{ y: query ? -100 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="pointer-events-auto mt-40 w-full px-4">
        <div className="relative mx-auto w-full max-w-md">
          <input
            type="text"
            placeholder="Поиск статуса..."
            value={query}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-black/10 dark:bg-white/10 backdrop-blur-lg text-card-foreground placeholder:text-muted-foreground shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] px-4 py-3 outline-none transition-all duration-200 ease-in-out focus:shadow-[0_0_0_3px_rgba(255,255,255,0.2)]"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                key="clear"
                type="button"
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default InputSearch;
