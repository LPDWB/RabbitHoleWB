"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useStatuses } from "@/hooks/useStatuses";
import { motion, AnimatePresence } from "framer-motion";
import LoadingText from "@/components/ui/loading-text";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

const SearchBar = dynamic(
  () => import("@/components/ui/search-bar").then((mod) => mod.SearchBar),
  { ssr: false }
);

const PAGE_TITLE = "Warehouse Statuses";

export default function Home() {
  const [query, setQuery] = useState("");
  const { statuses, loading, error } = useStatuses();

  const cardMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  const filteredStatuses = query.length
    ? statuses.filter((status) => {
        const q = query.toLowerCase();
        return (
          status.code.toLowerCase().includes(q) ||
          status.description.toLowerCase().includes(q) ||
          (status.action && status.action.toLowerCase().includes(q))
        );
      })
    : [];

  const hasResults = filteredStatuses.length > 0;

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
      <SearchBar query={query} setQuery={setQuery} />
      {loading && (
        <div className="-mt-2 flex justify-center">
          <LoadingText />
        </div>
      )}

      <motion.div
        className="max-h-[70vh] overflow-y-auto mt-6 w-full max-w-[800px] space-y-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        {!loading && (
          <AnimatePresence>
            {filteredStatuses.map((status) => (
              <motion.div
                key={status.code}
                {...cardMotion}
                whileHover={{ y: -4, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}
                className="rounded-2xl bg-white/10 backdrop-blur-md text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-4 space-y-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-lg font-bold">{status.code}</div>
                <div className="text-muted-foreground">{status.description}</div>
                {status.action && (
                  <div className="text-sm mt-1 text-muted-foreground">
                    Действия: {status.action}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && query && !hasResults && (
          <motion.div className="text-muted-foreground italic mt-4">
            Ничего не найдено
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
