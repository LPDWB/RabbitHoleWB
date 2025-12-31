"use client";

import React from "react";
import { motion } from "framer-motion";
import LoadingText from "@/components/ui/loading-text";
import { useSearch } from "@/hooks/useSearch";
import InputSearch from "@/components/InputSearch";
import SearchResults from "@/components/SearchResults";
import StatusCard from "@/components/StatusCard";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  const { query, setQuery, clear, results, loading, error } = useSearch();
  const hasResults = results.length > 0;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-6 pb-20 pt-32">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Поиск статусов</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Введите код статуса или ключевое слово, чтобы увидеть описание и действия.
          </p>
        </div>

        <div className="mt-8 w-full">
          <InputSearch query={query} onChange={setQuery} onClear={clear} />
        </div>

        {loading && (
          <div className="mt-4 flex justify-center">
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
      </div>
    </main>
  );
}
