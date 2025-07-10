"use client";

import React, { useState, useEffect } from "react";
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
  const [moveUp, setMoveUp] = useState(false);

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

  useEffect(() => {
    setMoveUp(filteredStatuses.length > 0);
  }, [filteredStatuses.length]);

  return (
    <main className="relative min-h-screen overflow-y-auto bg-background text-foreground pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        <div className="ml-4" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center w-full max-w-xl px-4"
        initial={false}
        animate={{ top: moveUp ? "10vh" : "50vh" }}
        transition={{ type: "spring", stiffness: 100 }}
        style={{ translateY: "-50%" }}
      >
        <h1 className="text-center text-2xl mb-4">{PAGE_TITLE}</h1>
        <SearchBar query={query} setQuery={setQuery} />
      </motion.div>

      <div className="pt-[calc(10vh+4rem)] px-4 w-full flex justify-center">
        <div className="w-full max-w-xl space-y-3">
          {error && <p className="text-red-500">Ошибка: {error}</p>}
          {loading ? (
            <LoadingText />
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
                  className="backdrop-blur-md bg-white/30 dark:bg-neutral-800/30 border border-white/20 dark:border-neutral-700/20 rounded-xl p-4 shadow cursor-pointer transition-colors duration-300"
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
