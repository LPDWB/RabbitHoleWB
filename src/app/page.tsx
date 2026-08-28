"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { AppHeader } from "@/components/AppHeader";
import { StatusCard, type WMSStatus } from "@/components/StatusCard";
import { AntigravityProvider } from "@/components/AntigravityContext";
import { Button } from "@/components/ui/button";

function AntigravityHomeContent() {
  const [statuses, setStatuses] = useState<WMSStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(36);

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

  // Automatically group statuses with identical description & action logic
  const groupedStatuses = useMemo(() => {
    const map = new Map<string, WMSStatus>();

    for (const s of statuses) {
      const normDesc = (s.description || "").trim().toLowerCase().replace(/\s+/g, " ");
      const normAction = (s.action || "").trim().toLowerCase().replace(/\s+/g, " ");
      const key = `${s.category}|||${normDesc}|||${normAction}`;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          ...s,
          codes: [s.code],
          count: 1,
        });
      } else {
        const codes = existing.codes || [existing.code];
        if (!codes.includes(s.code)) {
          codes.push(s.code);
          existing.codes = codes;
          existing.count = codes.length;
        }
      }
    }

    return Array.from(map.values());
  }, [statuses]);

  // Filtered and sorted statuses with intelligent ranking
  const filteredStatuses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groupedStatuses;

    return groupedStatuses
      .filter((s) => {
        const codes = s.codes || [s.code];
        const matchCode = codes.some((c) => c.toLowerCase().includes(q));
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchAction = s.action.toLowerCase().includes(q);
        const matchCategory = s.category.toLowerCase().includes(q);

        return matchCode || matchDesc || matchAction || matchCategory;
      })
      .sort((a, b) => {
        const aCodes = a.codes || [a.code];
        const bCodes = b.codes || [b.code];

        const aExactCode = aCodes.some((c) => c.toLowerCase() === q);
        const bExactCode = bCodes.some((c) => c.toLowerCase() === q);
        if (aExactCode && !bExactCode) return -1;
        if (bExactCode && !aExactCode) return 1;

        const aStartsCode = aCodes.some((c) => c.toLowerCase().startsWith(q));
        const bStartsCode = bCodes.some((c) => c.toLowerCase().startsWith(q));
        if (aStartsCode && !bStartsCode) return -1;
        if (bStartsCode && !aStartsCode) return 1;

        const aDesc = a.description.toLowerCase();
        const bDesc = b.description.toLowerCase();

        if (aDesc.startsWith(q) && !bDesc.startsWith(q)) return -1;
        if (bDesc.startsWith(q) && !aDesc.startsWith(q)) return 1;

        const aHasDesc = aDesc.includes(q);
        const bHasDesc = bDesc.includes(q);
        if (aHasDesc && !bHasDesc) return -1;
        if (!aHasDesc && bHasDesc) return 1;

        return 0;
      });
  }, [groupedStatuses, searchQuery]);

  // Reset visible count when search query changes
  useEffect(() => {
    setVisibleCount(36);
  }, [searchQuery]);

  const visibleStatuses = useMemo(() => {
    return filteredStatuses.slice(0, visibleCount);
  }, [filteredStatuses, visibleCount]);

  return (
    <div className="relative min-h-screen bg-[#0e0c15] text-zinc-100 selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      {/* Fixed Sticky Header with Center Search Bar */}
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalMatches={filteredStatuses.length}
        totalCount={groupedStatuses.length}
      />

      {/* Main Workspace: Starts directly under the header without filters to maximize screen space */}
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5">
          {/* Workspace Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-semibold tracking-tight text-zinc-300">
                {searchQuery ? (
                  <>
                    Найдено по запросу{" "}
                    <span className="text-fuchsia-400 font-bold">&laquo;{searchQuery}&raquo;</span>
                    :
                  </>
                ) : (
                  "База регламентов и статусов"
                )}
              </span>

              <span className="inline-flex items-center rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-xs font-mono font-bold text-fuchsia-300">
                {filteredStatuses.length}
              </span>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all"
              >
                <X className="h-3 w-3" />
                <span>Сбросить поиск</span>
              </button>
            )}
          </div>

          {/* Grid of Status Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
                />
              ))}
            </div>
          ) : filteredStatuses.length > 0 ? (
            <>
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {visibleStatuses.map((status, idx) => (
                    <StatusCard key={status.id || status.code} status={status} index={idx} />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Show More Pagination Controls */}
              {filteredStatuses.length > visibleCount && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 pb-12">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 36)}
                    className="rounded-xl px-6 py-2.5 bg-white/[0.03] hover:bg-fuchsia-500/10 border-white/10 hover:border-fuchsia-500/40 text-sm font-medium text-zinc-200 hover:text-fuchsia-300 transition-all shadow-sm"
                  >
                    Показать ещё (+36 из {filteredStatuses.length - visibleCount})
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setVisibleCount(filteredStatuses.length)}
                    className="rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  >
                    Показать все ({filteredStatuses.length})
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.08] p-12 text-center my-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-fuchsia-400">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base sm:text-lg font-bold text-zinc-100">
                Статус или операция не найдены
              </h3>
              <p className="mt-1 max-w-md text-xs sm:text-sm text-zinc-400">
                По запросу &laquo;{searchQuery}&raquo; нет совпадений. Проверьте правильность кода (например, AIP, ASP) или ключевого слова (Приемка, Сборка).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-5 rounded-xl border-white/10 bg-white/[0.04] hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50 text-zinc-200 text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Сбросить поиск
              </Button>
            </div>
          )}
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
