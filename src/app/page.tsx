"use client";

import React from "react";
import { motion } from "framer-motion";
import LoadingText from "@/components/ui/loading-text";
import { useSearch } from "@/hooks/useSearch";
import InputSearch from "@/components/InputSearch";
import SearchResults from "@/components/SearchResults";
import StatusCard from "@/components/StatusCard";
import { AppHeader } from "@/components/AppHeader";

const PAGE_TITLE = "Warehouse Statuses";

export default function Home() {
  const { query, setQuery, clear, results, loading, error } = useSearch();
  const hasResults = results.length > 0;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden pb-20 pt-28 text-foreground">
      <AppHeader />
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
