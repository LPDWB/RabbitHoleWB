"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock3,
  FolderTree,
  SearchCode,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import AmbientCursorGlow from "@/components/AmbientCursorGlow";
import { AppHeader } from "@/components/AppHeader";
import InputSearch from "@/components/InputSearch";
import SearchResults from "@/components/SearchResults";
import StatusCard from "@/components/StatusCard";
import LoadingText from "@/components/ui/loading-text";
import { useSearch } from "@/hooks/useSearch";

const RECENT_QUERIES_KEY = "wms-stats:recent-queries";

const QUICK_CATEGORIES = [
  {
    label: "Приемка",
    query: "приемка",
    hint: "Поступление, приемка и оприходование товара",
  },
  {
    label: "Упаковка",
    query: "упаковка",
    hint: "Переупаковка, доупаковка и контроль упаковки",
  },
  {
    label: "Сборка",
    query: "сборка",
    hint: "Листы сборки, подбор товара и маршруты отбора",
  },
  {
    label: "Сортировка",
    query: "сортировка",
    hint: "Распределение по потокам, направлениям и зонам",
  },
  {
    label: "Инвентаризация",
    query: "инвентаризация",
    hint: "Проверка остатков, ячеек и штрихкодов",
  },
  {
    label: "Брак",
    query: "брак",
    hint: "Дефекты, экспертиза, возвраты и утилизация",
  },
];

function uniqueStatusesByCode<T extends { code: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const normalized = (item.code ?? "").trim().toUpperCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export default function Home() {
  const { query, setQuery, clear, results, statuses, loading, error } = useSearch();
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;

  const popularStatuses = useMemo(
    () => uniqueStatusesByCode(statuses).slice(0, 8),
    [statuses]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_QUERIES_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentQueries(parsed.filter((value) => typeof value === "string").slice(0, 6));
      }
    } catch {
      setRecentQueries([]);
    }
  }, []);

  const registerRecentQuery = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setRecentQueries((previous) => {
      const next = [trimmed, ...previous.filter((item) => item !== trimmed)].slice(0, 6);

      try {
        window.localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(next));
      } catch {
        // Ignore localStorage write failures in restricted environments.
      }

      return next;
    });
  };

  const applyQuery = (value: string) => {
    setQuery(value);
    registerRecentQuery(value);
  };

  const submitCurrentQuery = () => {
    registerRecentQuery(query);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <AmbientCursorGlow className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <section className="min-w-0 space-y-4 lg:space-y-5">
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_260px] 2xl:items-end">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] text-muted-foreground">
                  <SearchCode className="h-3.5 w-3.5 text-accent" />
                  Internal lookup console
                </div>

                <div className="max-w-3xl space-y-3">
                  <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-gradient-soft sm:text-5xl">
                    Поиск статусов WMS
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                    Рабочая консоль для быстрого поиска кодов, описаний и действий по
                    статусам. Введите точный код или ключевые слова, чтобы сразу
                    получить нужный ответ без лишней навигации.
                  </p>
                </div>
              </div>

              <div className="panel-surface hidden rounded-[1.35rem] p-4 2xl:block">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Режим поиска
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/92">
                  Коды обрабатываются как команда. Текстовые запросы ищут по словам в
                  описании и действиях.
                </p>
              </div>
            </div>

            <InputSearch
              query={query}
              onChange={setQuery}
              onClear={clear}
              onSubmit={submitCurrentQuery}
            />

            <AnimatePresence initial={false}>
              {hasQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"
                >
                  <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1">
                    Запрос: <span className="font-medium text-foreground">{query}</span>
                  </span>
                  {!loading && (
                    <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1">
                      Найдено:{" "}
                      <span className="font-medium text-foreground">{results.length}</span>
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!hasQuery && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="panel-surface rounded-[1.45rem] p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold tracking-tight">Быстрые категории</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {QUICK_CATEGORIES.map((category) => (
                    <button
                      key={category.label}
                      data-glow="base"
                      type="button"
                      onClick={() => applyQuery(category.query)}
                      className="panel-surface interactive-surface group rounded-[1.2rem] p-4 text-left"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {category.label}
                        </span>
                        <Sparkles className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent" />
                      </div>
                      <p className="text-xs leading-6 text-muted-foreground">
                        {category.hint}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {loading && hasQuery && (
              <div className="pt-1">
                <LoadingText />
              </div>
            )}

            <SearchResults visible={hasQuery}>
              {error && (
                <div className="panel-surface rounded-[1.35rem] p-4 text-sm text-destructive">
                  Ошибка загрузки: {error}
                </div>
              )}

              {!loading &&
                results.map((status, index) => (
                  <StatusCard
                    key={`${status.code}-${status.description}-${index}`}
                    status={status}
                    query={query}
                    index={index}
                  />
                ))}

              {!loading && hasQuery && !hasResults && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="panel-surface rounded-[1.45rem] p-6 text-sm text-muted-foreground"
                >
                  Ничего не найдено. Попробуйте сократить запрос, ввести код статуса
                  целиком или выбрать одну из быстрых категорий выше.
                </motion.div>
              )}
            </SearchResults>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <section className="panel-surface rounded-[1.45rem] p-4">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold tracking-tight">Популярные статусы</h2>
              </div>

              {loading ? (
                <LoadingText />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {popularStatuses.map((status) => (
                    <button
                      key={`popular-${status.code}`}
                      data-glow="action"
                      type="button"
                      onClick={() => applyQuery(status.code)}
                      className="action-chip rounded-xl font-mono"
                    >
                      {status.code}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="panel-surface rounded-[1.45rem] p-4">
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold tracking-tight">Последние запросы</h2>
              </div>

              {recentQueries.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  История появится после первых поисковых запросов.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recentQueries.map((item) => (
                    <button
                      key={`recent-${item}`}
                      data-glow="action"
                      type="button"
                      onClick={() => applyQuery(item)}
                      className="action-chip rounded-xl"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </AmbientCursorGlow>
    </main>
  );
}
