"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import React from "react";

interface Props {
  query: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

const InputSearch: React.FC<Props> = ({ query, onChange, onClear }) => {
  return (
    <motion.div className="w-full" animate={{ y: query ? -4 : 0 }} transition={{ duration: 0.3 }}>
      <div className="relative mx-auto w-full max-w-2xl">
        <input
          type="text"
          placeholder="Поиск статуса..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          className="glass glass-field w-full rounded-2xl px-11 py-4 text-base ring-offset-background placeholder:text-muted-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--glass-ring)] focus-visible:ring-offset-2"
        />
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <AnimatePresence>
          {query && (
            <motion.button
              key="clear"
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InputSearch;
