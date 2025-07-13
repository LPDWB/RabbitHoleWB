"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      animate={{ y: inputValue ? -80 : 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="relative z-10 w-full max-w-[480px]"
    >
      <div className="bg-white/10 dark:bg-neutral-900/10 backdrop-blur-lg border border-white/10 rounded-xl shadow-md px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-accent scale-100 focus-within:scale-105">
        <input
          ref={inputRef}
          type="text"
          placeholder="Поиск статуса..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
      </div>
    </motion.div>
  );
};
