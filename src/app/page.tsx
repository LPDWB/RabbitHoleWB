"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import LoadingText from "@/components/ui/loading-text";
import { useSearch } from "@/hooks/useSearch";
import InputSearch from "@/components/InputSearch";
import SearchResults from "@/components/SearchResults";
import StatusCard from "@/components/StatusCard";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

const PAGE_TITLE = "Warehouse Statuses";

export default function Home() {
  const { query, setQuery, clear, results, loading, error } = useSearch();
  const hasResults = results.length > 0;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-x-hidden text-foreground pb-20">
      {/* Header */}
      <header className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        <div className="ml-4" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="fixed top-4 left-4 text-white font-semibold text-lg">WMS Stats</div>
      <InputSearch query={query} onChange={setQuery} onClear={clear} />
      {loading && (
        <div className="-mt-2 flex justify-center">
          <LoadingText />
        </div>
      )}

      <SearchResults visible={query.length > 0}>
        {error && <p className="text-destructive">Ошибка: {error}</p>}
        {!loading &&
          results.map((status) => (
            <StatusCard key={status.code} status={status} query={query} />
          ))}
        {!loading && query && !hasResults && (
          <motion.div className="text-muted-foreground italic">
            Ничего не найдено
          </motion.div>
        )}
      </SearchResults>
    </main>
  );
}
