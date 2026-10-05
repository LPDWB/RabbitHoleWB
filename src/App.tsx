"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Home,
  Wrench,
  Settings,
  Search,
  Copy,
  Check,
  X,
  RotateCcw,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";
import Papa from "papaparse";

// --- TYPES ---
export interface WMSStatusItem {
  id: string;
  code: string;
  category: string;
  description: string;
  action: string;
}

// Ссылка на опубликованную в веб Google Таблицу (Published to web CSV)
const DEFAULT_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLvAMU_aedXIh-bIf8WfGBFDG-E2yBCh1MQ4SvyDgGznfRp0lotEnqWsf8EQi8lzIptoMJqgHrsbdv/pub?gid=0&single=true&output=csv";

// Category detector
function detectCategory(code: string, desc: string, act: string): string {
  const text = `${code} ${desc} ${act}`.toLowerCase();
  if (text.includes("приемк") || code.startsWith("AI") || code.startsWith("AS") || code.startsWith("RCV") || code.startsWith("APR")) {
    return "Приемка";
  }
  if (text.includes("расклад") || text.includes("хранени") || text.includes("мезонин") || text.includes("ячейк") || code.startsWith("PLC") || code.startsWith("STR")) {
    return "Раскладка и МХ";
  }
  if (text.includes("сборк") || text.includes("отбор") || text.includes("комплект") || code.startsWith("PIK") || code.startsWith("COL")) {
    return "Сборка";
  }
  if (text.includes("упаковк") || text.includes("короб") || text.includes("скотч") || text.includes("пакет") || code.startsWith("PAK") || code.startsWith("BOX")) {
    return "Упаковка";
  }
  if (text.includes("сортировк") || text.includes("отгрузк") || text.includes("рейс") || text.includes("тягач") || text.includes("ворота") || code.startsWith("SRT") || code.startsWith("SHP")) {
    return "Сортировка и Отгрузка";
  }
  if (text.includes("перемещен") || text.includes("ричтрак") || text.includes("погрузчик") || text.includes("штабелер") || code.startsWith("MOV") || code.startsWith("PAL")) {
    return "Перемещение";
  }
  if (text.includes("инвентар") || text.includes("ревизи") || text.includes("пересчет") || code.startsWith("INV") || code.startsWith("CNT")) {
    return "Инвентаризация";
  }
  if (text.includes("брак") || text.includes("дефект") || text.includes("поврежд") || text.includes("некондиц") || text.includes("карантин") || code.startsWith("DEF") || code.startsWith("DMG")) {
    return "Брак и Проблемы";
  }
  if (text.includes("возврат") || text.includes("пвз") || code.startsWith("RTN") || code.startsWith("REF")) {
    return "Возвраты";
  }
  return "Складской процесс";
}

// Flat, strict minimalist status card (no shadow, no blur)
const StatusCard = React.memo(({ item }: { item: WMSStatusItem }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`#${item.code} - ${item.description}: ${item.action}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="group rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700 transition-colors duration-200 p-5 flex flex-col justify-between h-full min-h-[160px]">
      <div>
        {/* Top row: #ID + compact copy button (left), pill category badge (right) */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-fuchsia-400 font-mono font-semibold text-xl tracking-wide">
              #{item.code}
            </span>

            {/* Small copy icon, visible on hover */}
            <button
              type="button"
              onClick={handleCopy}
              title="Копировать регламент"
              className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-150"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Pill category badge */}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 whitespace-nowrap shrink-0">
            {item.category}
          </span>
        </div>

        {/* Operation Title */}
        <p className="text-sm font-medium text-zinc-200 mb-2 leading-snug">
          {item.description}
        </p>

        {/* Regulation description */}
        <p className="text-xs text-zinc-400 leading-relaxed font-normal">
          {item.action}
        </p>
      </div>
    </div>
  );
});
StatusCard.displayName = "StatusCard";

// Virtuoso Grid layout configuration
const gridComponents = {
  List: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        style={style}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 w-full"
      >
        {children}
      </div>
    )
  ),
  Item: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props} className="h-full pb-1">
        {children}
      </div>
    )
  ),
};
gridComponents.List.displayName = "VirtuosoGridList";
gridComponents.Item.displayName = "VirtuosoGridItem";

// --- MAIN APP COMPONENT ---
export default function App() {
  // Navigation: Home, Wrench (Инструменты), Settings (Настройки)
  const [activeTab, setActiveTab] = useState<"home" | "wrench" | "settings">("home");

  // Statuses data & CSV fetch state
  const [statuses, setStatuses] = useState<WMSStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEETS_CSV_URL);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch & parse Google Sheets CSV with papaparse
  const loadGoogleSheetsData = useCallback(async (targetUrl = sheetUrl) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch CSV text from Google Sheets
      let response: Response;
      try {
        response = await fetch(targetUrl);
      } catch {
        // If direct fetch is blocked by CORS, try via internal Next.js proxy route
        response = await fetch("/api/statuses");
      }

      if (!response.ok) {
        throw new Error(`Ошибка HTTP при загрузке таблицы: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      let parsedItems: WMSStatusItem[] = [];

      // If JSON (from proxy API)
      if (contentType.includes("application/json")) {
        const json = await response.json();
        if (Array.isArray(json.statuses)) {
          parsedItems = json.statuses.map((s: { id?: string; code?: string; category?: string; description?: string; action?: string }, idx: number) => ({
            id: s.id || `wms-${idx}`,
            code: (s.code || "").replace(/^#/, ""),
            category: s.category || detectCategory(s.code || "", s.description || "", s.action || ""),
            description: s.description || "Без названия",
            action: s.action || "Регламент отсутствует",
          }));
        }
      } else {
        // Parse CSV text with papaparse
        const csvText = await response.text();
        const parsed = Papa.parse<Record<string, string>>(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        parsedItems = parsed.data
          .map((row: Record<string, string>, idx: number) => {
            const code = (
              row["Статус"] ||
              row["status"] ||
              row["Status"] ||
              row["Код"] ||
              row["ID"] ||
              ""
            ).trim();

            const description = (
              row["Описание"] ||
              row["description"] ||
              row["Description"] ||
              row["Наименование"] ||
              ""
            ).trim();

            const action = (
              row["Совершаемые действия"] ||
              row["Действия"] ||
              row["action"] ||
              row["Action"] ||
              row["Регламент"] ||
              ""
            ).trim();

            if (!code && !description && !action) return null;

            return {
              id: `sheet-${idx}-${code}`,
              code: code.replace(/^#/, ""),
              category: detectCategory(code, description, action),
              description: description || "Без описания",
              action: action || "Регламент не указан",
            };
          })
          .filter(Boolean) as WMSStatusItem[];
      }

      if (parsedItems.length === 0) {
        throw new Error("В таблице не найдено записей о статусах");
      }

      setStatuses(parsedItems);
    } catch (err: unknown) {
      console.error("Failed to load Google Sheets:", err);
      const message = err instanceof Error ? err.message : "Не удалось загрузить данные из Google Sheets";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl]);

  // Initial load
  useEffect(() => {
    loadGoogleSheetsData();
  }, [loadGoogleSheetsData]);

  // Filtered statuses
  const filteredStatuses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return statuses.filter((item) => {
      const matchCode = item.code.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAction = item.action.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchCode || matchDesc || matchAction || matchCat;
    });
  }, [searchQuery, statuses]);

  // Global '/' keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setSearchQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="flex h-screen w-full bg-[#0c0b12] text-gray-200 overflow-hidden font-sans antialiased">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-16 h-full flex flex-col justify-between items-center py-6 bg-[#09090b] border-r border-zinc-800/50 shrink-0 z-20">
        {/* Navigation buttons: Home, Wrench */}
        <div className="flex flex-col items-center gap-2">
          {/* Home */}
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            title="Главная (Поиск регламентов)"
            className={`p-3 transition-all duration-150 ${
              activeTab === "home"
                ? "bg-zinc-800 text-white rounded-xl"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 rounded-xl"
            }`}
          >
            <Home className="h-5 w-5" />
          </button>

          {/* Wrench (Инструменты) */}
          <button
            type="button"
            onClick={() => setActiveTab("wrench")}
            title="Инструменты"
            className={`p-3 transition-all duration-150 ${
              activeTab === "wrench"
                ? "bg-zinc-800 text-white rounded-xl"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 rounded-xl"
            }`}
          >
            <Wrench className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom button: Settings (Настройки) */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            title="Настройки"
            className={`p-3 transition-all duration-150 ${
              activeTab === "settings"
                ? "bg-zinc-800 text-white rounded-xl"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 rounded-xl"
            }`}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN COLUMN (NO HEADER, TOP RIGHT IS COMPLETELY EMPTY) */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden relative">
        <main ref={setScrollParent} className="flex-1 overflow-y-auto relative w-full">
          {/* VIEW 1: WRENCH (ИНСТРУМЕНТЫ) PLACEHOLDER */}
          {activeTab === "wrench" && (
            <div className="max-w-2xl mx-auto px-6 py-28 text-center animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                <Wrench className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100 mb-2">Инструменты</h2>
              <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
                Раздел инструментов находится в разработке. Здесь будут доступны утилиты для сканирования, маркировки и генерации штрихкодов ТСД.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
              >
                Вернуться к поиску
              </button>
            </div>
          )}

          {/* VIEW 2: SETTINGS (НАСТРОЙКИ) PLACEHOLDER & GOOGLE SHEETS CONFIG */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto px-6 py-16 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <Settings className="h-5 w-5 text-zinc-300" />
                  <h2 className="text-lg font-bold text-zinc-100">Настройки</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Вернуться к поиску
                </button>
              </div>

              <div className="space-y-4">
                {/* Google Sheets Link setting */}
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200">Источник Google Sheets (CSV)</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Прямая ссылка на экспорт таблицы в формате CSV</p>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => loadGoogleSheetsData()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs font-medium text-white transition-colors"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                      <span>Обновить</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
                  />

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <span>
                      Загружено статусов:{" "}
                      <b className="text-zinc-200">{statuses.length}</b>
                    </span>
                    {isLoading && (
                      <span className="flex items-center gap-1 text-fuchsia-400">
                        <Loader2 className="h-3 w-3 animate-spin" /> Загрузка...
                      </span>
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">Спецификация</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Парсинг выполняется на клиенте через библиотеку <code>papaparse</code>. Рендеринг списка оптимизирован через <code>react-virtuoso</code> для поддержания стабильных 60 FPS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: HOME (MAIN SEARCH & VIRTUOSO LIST) */}
          {activeTab === "home" && (
            <div
              className={`max-w-5xl mx-auto w-full px-4 sm:px-6 transition-all duration-500 ease-out flex flex-col ${
                isSearchActive ? "pt-8" : "pt-[35vh]"
              }`}
            >
              {/* Modern IDE Search Bar (dark mode, rounded-2xl, bg-zinc-900) */}
              <div className="w-full">
                <div className="relative flex items-center rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/30 py-4 px-6 transition-all duration-200">
                  {/* Magnifier Icon */}
                  <Search className="h-5 w-5 text-zinc-500 focus-within:text-zinc-300 shrink-0 mr-4 transition-colors" />

                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по коду статуса или названию..."
                    className="w-full bg-transparent text-lg text-gray-200 placeholder:text-zinc-500 focus:outline-none font-normal"
                  />

                  {/* Results count indicator */}
                  {isSearchActive && (
                    <span className="hidden sm:inline-flex items-center text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-0.5 mr-3 shrink-0">
                      {filteredStatuses.length}
                    </span>
                  )}

                  {/* Clear Button or '/' Keyboard Badge */}
                  {isSearchActive ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        inputRef.current?.focus();
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
                      title="Очистить"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-md px-2 py-1 text-xs font-medium border border-zinc-750 shrink-0 select-none">
                      /
                    </kbd>
                  )}
                </div>

                {/* Subtitle helper text: modern sans-serif font */}
                {!isSearchActive && (
                  <p className="text-center text-sm text-zinc-500 font-sans mt-4 transition-opacity duration-300">
                    Введите код статуса (например, <span className="text-zinc-400 font-medium">AIP</span>, <span className="text-zinc-400 font-medium">ASP</span>) или название операции
                  </p>
                )}

                {/* Error Banner if loading failed */}
                {error && (
                  <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-between text-xs text-red-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadGoogleSheetsData()}
                      className="underline hover:text-red-100 shrink-0 ml-3"
                    >
                      Повторить
                    </button>
                  </div>
                )}
              </div>

              {/* Status info bar when active */}
              {isSearchActive && (
                <div className="w-full py-3 my-2 flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/40">
                  <span>
                    Найдено регламентов:{" "}
                    <span className="text-zinc-200 font-medium">{filteredStatuses.length}</span>{" "}
                    из {statuses.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-zinc-200 flex items-center gap-1.5 transition-colors text-zinc-500"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Сбросить
                  </button>
                </div>
              )}

              {/* Virtualized Cards List (VirtuosoGrid) - ONLY shown when searching */}
              {isSearchActive ? (
                filteredStatuses.length > 0 ? (
                  <div className="w-full pt-3">
                    <VirtuosoGrid
                      customScrollParent={scrollParent || undefined}
                      data={filteredStatuses}
                      totalCount={filteredStatuses.length}
                      overscan={300}
                      components={gridComponents}
                      itemContent={(_idx, item) => <StatusCard key={item.id} item={item} />}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
                      <Search className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200">Ничего не найдено</h3>
                    <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                      По запросу &laquo;{searchQuery}&raquo; статусы не найдены. Проверьте правильность написания.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs text-zinc-300 transition-colors"
                    >
                      Очистить поиск
                    </button>
                  </div>
                )
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
