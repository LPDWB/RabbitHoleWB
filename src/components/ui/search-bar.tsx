"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  hasResults: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, hasResults }) => {
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
    <motion.div
      animate={{ y: hasResults ? -80 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed left-1/2 top-20 z-40 w-[320px] -translate-x-1/2"
    >
      <div className="relative rounded-xl bg-white/10 dark:bg-white/5 border border-white/10 backdrop-blur-md shadow-md px-4 py-2 text-base w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Поиск статуса..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-transparent pl-8 pr-8 outline-none"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => setInputValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
