"use client";

import React, { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onPositionReady?: (pos: { x: number; y: number }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onPositionReady }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(query);
  const [debouncedValue, setDebouncedValue] = useState(query);

  // Report input position if needed
  useEffect(() => {
    if (inputRef.current && onPositionReady) {
      const rect = inputRef.current.getBoundingClientRect();
      onPositionReady({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2 + window.scrollY,
      });
    }
  }, [onPositionReady]);

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
      className="px-4 py-3 text-lg rounded-xl border border-muted bg-background text-foreground shadow focus:outline-none transform transition-transform duration-200 hover:scale-105 focus:scale-105 hover:ring-1 hover:ring-accent focus:ring-1 focus:ring-accent"
    />
  );
};
