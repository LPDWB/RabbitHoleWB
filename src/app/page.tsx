"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { AppHeader } from "@/components/AppHeader";
import { InputSearch } from "@/components/InputSearch";
import { StatusCard, type WMSStatus } from "@/components/StatusCard";
import { AntigravityCanvas } from "@/components/AntigravityCanvas";
import { AntigravityProvider, useAntigravity } from "@/components/AntigravityContext";
import { Button } from "@/components/ui/button";

function AntigravityHomeContent() {
  const [statuses, setStatuses] = useState<WMSStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const { zeroG, hapticPulse } = useAntigravity();

  useEffect(() => {
    async function loadStatuses() {
      try {
        setLoading(true);
        const res = await fetch("/api/statuses");
        if (res.ok) {
          const data = await res.json();
          setStatuses(data.statuses || []);
        }
      } catch (err) {
        console.error("Failed to load statuses", err);
      } finally {
        setLoading(false);
      }
    }
    loadStatuses();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    statuses.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["Все", ...Array.from(set)];
  }, [statuses]);

  // Filtered and sorted statuses with intelligent ranking
  const filteredStatuses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return statuses
      .filter((s) => {
        const matchCat =
          selectedCategory === "Все" || s.category.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchCat) return false;
        if (!q) return true;

        return (
          s.code.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.action.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (!q) return 0;
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();
        const aDesc = a.description.toLowerCase();
        const bDesc = b.description.toLowerCase();

        // 1. Exact code match
        if (aCode === q && bCode !== q) return -1;
        if (bCode === q && aCode !== q) return 1;

        // 2. Code starts with query
        if (aCode.startsWith(q) && !bCode.startsWith(q)) return -1;
        if (bCode.startsWith(q) && !aCode.startsWith(q)) return 1;

        // 3. Operation description starts with query
        if (aDesc.startsWith(q) && !bDesc.startsWith(q)) return -1;
        if (bDesc.startsWith(q) && !aDesc.startsWith(q)) return 1;

        // 4. Operation description contains query
        const aHasDesc = aDesc.includes(q);
        const bHasDesc = bDesc.includes(q);
        if (aHasDesc && !bHasDesc) return -1;
        if (!aHasDesc && bHasDesc) return 1;

        return 0;
      });
  }, [statuses, searchQuery, selectedCategory]);

  const [visibleCount, setVisibleCount] = useState(36);

  // Reset visible count when search or category changes
  useEffect(() => {
    setVisibleCount(36);
  }, [searchQuery, selectedCategory]);

  const visibleStatuses = useMemo(() => {
    return filteredStatuses.slice(0, visibleCount);
  }, [filteredStatuses, visibleCount]);

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/25">
      {/* Background Interactive Antigravity Canvas */}
      <AntigravityCanvas />

      <AppHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="flex flex-col gap-10">
          {/* Antigravity Hero Section */}
          <div className="relative flex flex-col items-center text-center">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
            >
              Управление статусами в{" "}
              <span className="google-laser-text">невесомости</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed font-normal"
            >
              Мгновенный поиск кодов операций склада, регламентов ТСД и автоматическая обработка штрихкодов.
            </motion.p>

            {/* Search Input Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-8 w-full"
            >
              <InputSearch
                value={searchQuery}
                onChange={setSearchQuery}
                totalMatches={filteredStatuses.length}
              />
            </motion.div>

            {/* Dynamic Orbital Category Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl"
            >
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      hapticPulse(1);
                    }}
                    className={`quantum-chip relative ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-semibold shadow-md shadow-primary/25"
                        : "hover:border-primary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{category}</span>
                    {category === "Все" && (
                      <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-mono">
                        {statuses.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="antigravity-card flex flex-col gap-1 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Кодов в базе
              </span>
              <span className="font-mono text-2xl font-bold text-primary">{statuses.length}</span>
              <span className="text-[11px] text-muted-foreground">Синхронизировано</span>
            </div>

            <div className="antigravity-card flex flex-col gap-1 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Категорий
              </span>
              <span className="font-mono text-2xl font-bold text-foreground">
                {categories.length - 1}
              </span>
              <span className="text-[11px] text-muted-foreground">Все зоны склада</span>
            </div>

            <div className="antigravity-card flex flex-col gap-1 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Отклик поиска
              </span>
              <span className="font-mono text-2xl font-bold text-emerald-400">&lt; 1ms</span>
              <span className="text-[11px] text-muted-foreground">Instant Indexing</span>
            </div>

            <div className="antigravity-card flex flex-col gap-1 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Физика Zero-G
              </span>
              <span className="font-mono text-2xl font-bold text-purple-400">
                {zeroG ? "Активна" : "Пассивна"}
              </span>
              <span className="text-[11px] text-muted-foreground">Orbital Engine</span>
            </div>
          </div>

          {/* Results Grid / List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {selectedCategory === "Все" ? "Все статусы" : `Статусы: ${selectedCategory}`}
                </h2>
                <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-mono text-muted-foreground border border-border">
                  {filteredStatuses.length}
                </span>
              </div>

              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Сбросить поиск
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="antigravity-card h-48 animate-pulse rounded-3xl p-6 opacity-60"
                  />
                ))}
              </div>
            ) : filteredStatuses.length > 0 ? (
              <>
                <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {visibleStatuses.map((status, idx) => (
                      <StatusCard key={status.id || status.code} status={status} index={idx} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {filteredStatuses.length > visibleCount && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((prev) => prev + 36)}
                      className="rounded-full px-6 py-2 border-primary/30 hover:border-primary text-sm font-medium"
                    >
                      Показать ещё (+36 из {filteredStatuses.length - visibleCount})
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setVisibleCount(filteredStatuses.length)}
                      className="rounded-full text-xs text-muted-foreground hover:text-foreground"
                    >
                      Показать все ({filteredStatuses.length})
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="antigravity-card flex flex-col items-center justify-center rounded-3xl p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border text-muted-foreground">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">Ничего не найдено</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  По запросу &laquo;{searchQuery}&raquo; в категории &laquo;{selectedCategory}&raquo; ничего не найдено.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Все");
                  }}
                  className="mt-4 rounded-full"
                >
                  Сбросить все фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <AntigravityProvider>
      <AntigravityHomeContent />
    </AntigravityProvider>
  );
}
