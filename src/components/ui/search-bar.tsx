"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(query);
  const [debouncedValue, setDebouncedValue] = useState(query);


  // Debounce input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Propagate debounced value
  useEffect(() => {
    setQuery(debouncedValue);
  }, [debouncedValue, setQuery]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <motion.div
        animate={{ y: inputValue.length > 0 ? -150 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="pointer-events-auto w-full px-4"
      >
        <div className="relative mx-auto w-full max-w-md">
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск статуса..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-xl bg-black/30 backdrop-blur-md text-white placeholder:text-gray-400 outline-none transition-all duration-300 focus:ring-2 ring-violet-400 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          />
          <AnimatePresence>
            {inputValue.length > 0 && (
              <motion.button
                key="clear"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
