"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useStatuses } from "@/hooks/useStatuses";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCard from "@/components/ui/skeleton-card";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

const SearchBar = dynamic(
  () => import("@/components/ui/search-bar").then((mod) => mod.SearchBar),
  { ssr: false }
);

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
    <main className="relative min-h-screen overflow-y-auto bg-background text-foreground pb-20">
      {/* Header */}
      <header className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        <div className="ml-4">
          <span className="text-lg font-semibold hidden sm:inline-block">
            WMS Stats
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col items-center justify-start min-h-screen pt-32 px-4">
        <h1 className="text-center text-2xl mb-8">WMS Stats</h1>

        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-xl">
            <SearchBar query={query} setQuery={setQuery} />
          </div>
        </div>

        <div className="w-full max-w-xl space-y-3">
          {error && <p className="text-red-500">Ошибка: {error}</p>}
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <AnimatePresence>
              {filteredStatuses.map((status) => (
                <motion.div
                  key={status.code}
                  {...cardMotion}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                  }}
                  className="bg-card border border-border p-4 rounded-xl shadow cursor-pointer transition-colors"
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
        </div>
      </div>
    </main>
  );
}
