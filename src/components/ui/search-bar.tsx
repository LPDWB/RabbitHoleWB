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
  const [isFocused, setIsFocused] = useState(false);

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
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={(e) => setInputValue(e.target.value)}
      className={`px-4 py-3 text-lg rounded-xl border border-muted bg-background text-foreground shadow focus:outline-none transition-all duration-300 ${isFocused ? "ring-2 ring-accent" : ""}`}
      style={{ width: isFocused ? "calc(100% + 20px)" : "100%" }}
    />
  );
};
