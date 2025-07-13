"use client";

import React, { useEffect, useRef, useState } from "react";

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
    <input
      ref={inputRef}
      type="text"
      placeholder="Поиск статуса..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="relative z-10 px-4 py-3 text-lg bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 shadow-md rounded-xl text-foreground focus:outline-none transition-all duration-200 hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-accent"
    />
  );
};
