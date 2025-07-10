"use client";

import React, { useEffect, useRef } from "react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onPositionReady?: (pos: { x: number; y: number }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onPositionReady }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && onPositionReady) {
      const rect = inputRef.current.getBoundingClientRect();
      onPositionReady({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2 + window.scrollY,
      });
    }
  }, [inputRef.current]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Поиск статуса..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-4 py-3 text-lg rounded-xl border border-muted bg-background text-foreground shadow focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
};
