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
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: "easeInOut" },
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

  return (
    <main className="relative min-h-screen overflow-y-auto bg-white/5 dark:bg-neutral-900/10 backdrop-blur-lg text-foreground pb-20 transition-colors duration-300 flex flex-col items-center pt-[100px] gap-6">
      {/* Header */}
      <header className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        <div className="ml-4" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <h1 className="text-center text-2xl">{PAGE_TITLE}</h1>
      <SearchBar query={query} setQuery={setQuery} />
      {loading && (
        <div className="-mt-2 flex justify-center">
          <LoadingText />
        </div>
      )}

      <motion.div
        className="w-full max-w-xl px-4 space-y-3 max-h-[60vh] overflow-y-auto"
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
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                }}
                className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 shadow-md rounded-xl p-4 cursor-pointer transition-colors duration-300"
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
      </motion.div>
    </main>
  );
}
