"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Home,
  Wrench,
  Search,
  Copy,
  Check,
  X,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Cloud,
  ChevronRight,
  Download,
  Trash2,
  Barcode,
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

// Прямая публичная ссылка на Google Таблицу (Published to web CSV)
const DEFAULT_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLvAMU_aedXIh-bIf8WfGBFDG-E2yBCh1MQ4SvyDgGznfRp0lotEnqWsf8EQi8lzIptoMJqgHrsbdv/pub?gid=0&single=true&output=csv";

// Определение категории
function detectCategory(code: string, desc: string, act: string): string {
  const text = `${code} ${desc} ${act}`.toLowerCase();
  if (
    text.includes("приемк") ||
    code.startsWith("AI") ||
    code.startsWith("AS") ||
    code.startsWith("RCV") ||
    code.startsWith("APR")
  ) {
    return "Приемка";
  }
  if (
    text.includes("расклад") ||
    text.includes("хранени") ||
    text.includes("мезонин") ||
    text.includes("ячейк") ||
    code.startsWith("PLC") ||
    code.startsWith("STR")
  ) {
    return "Раскладка и МХ";
  }
  if (
    text.includes("сборк") ||
    text.includes("отбор") ||
    text.includes("комплект") ||
    code.startsWith("PIK") ||
    code.startsWith("COL")
  ) {
    return "Сборка";
  }
  if (
    text.includes("упаковк") ||
    text.includes("короб") ||
    text.includes("скотч") ||
    text.includes("пакет") ||
    code.startsWith("PAK") ||
    code.startsWith("BOX")
  ) {
    return "Упаковка";
  }
  if (
    text.includes("сортировк") ||
    text.includes("отгрузк") ||
    text.includes("рейс") ||
    text.includes("тягач") ||
    text.includes("ворота") ||
    code.startsWith("SRT") ||
    code.startsWith("SHP")
  ) {
    return "Сортировка и Отгрузка";
  }
  if (
    text.includes("перемещен") ||
    text.includes("ричтрак") ||
    text.includes("погрузчик") ||
    text.includes("штабелер") ||
    code.startsWith("MOV") ||
    code.startsWith("PAL")
  ) {
    return "Перемещение";
  }
  if (
    text.includes("инвентар") ||
    text.includes("ревизи") ||
    text.includes("пересчет") ||
    code.startsWith("INV") ||
    code.startsWith("CNT")
  ) {
    return "Инвентаризация";
  }
  if (
    text.includes("брак") ||
    text.includes("дефект") ||
    text.includes("поврежд") ||
    text.includes("некондиц") ||
    text.includes("карантин") ||
    code.startsWith("DEF") ||
    code.startsWith("DMG")
  ) {
    return "Брак и Проблемы";
  }
  if (
    text.includes("возврат") ||
    text.includes("пвз") ||
    code.startsWith("RTN") ||
    code.startsWith("REF")
  ) {
    return "Возвраты";
  }
  return "Складской процесс";
}

// Карточка статуса в плоском стиле Cloudflare (белый фон, серая рамка, без теней)
const StatusCard = React.memo(({ item }: { item: WMSStatusItem }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `#${item.code} - ${item.description}: ${item.action}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors flex flex-col justify-between h-full min-h-[148px]">
      <div>
        {/* Верхняя строка: #ID и кнопка копирования (слева), Бейдж категории (справа) */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-gray-100 border border-gray-200 text-gray-700 text-xs font-mono font-medium px-2 py-0.5 rounded">
              #{item.code}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              title="Скопировать регламент"
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs font-mono px-2 py-0.5 rounded shrink-0">
            {item.category}
          </span>
        </div>

        {/* Название операции */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 leading-snug">
          {item.description}
        </h3>

        {/* Действия / Регламент */}
        <p className="text-xs text-gray-600 leading-relaxed font-normal">
          {item.action}
        </p>
      </div>
    </div>
  );
});
StatusCard.displayName = "StatusCard";

// Конфигурация Virtuoso Grid
const gridComponents = {
  List: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        style={style}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-16 w-full"
      >
        {children}
      </div>
    )
  ),
  Item: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props} className="h-full">
        {children}
      </div>
    )
  ),
};
gridComponents.List.displayName = "VirtuosoGridList";
gridComponents.Item.displayName = "VirtuosoGridItem";

// --- КОМПОНЕНТ ИНСТРУМЕНТА: ВЫДЕЛИТЕЛЬ ШК / СТИКЕРОВ ---
function BarcodeSeparatorTool() {
  const [inputText, setInputText] = useState("");
  const [delimiter, setDelimiter] = useState<string>("newline");
  const [customDelimiter, setCustomDelimiter] = useState(",");
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [onlyNumbers, setOnlyNumbers] = useState(false);
  const [copied, setCopied] = useState(false);

  // Обработка текста
  const processedResult = useMemo(() => {
    if (!inputText) {
      return { items: [], text: "", stats: { total: 0, unique: 0, removed: 0 } };
    }

    // Разбиение по строкам, табуляциям, запятым, точкам с запятой
    let rawItems = inputText
      .split(/[\r\n,;\t]+/)
      .map((item) => item.trim());

    if (onlyNumbers) {
      rawItems = rawItems
        .map((item) => item.replace(/\D/g, ""))
        .filter((item) => item.length > 0);
    }

    rawItems = rawItems.filter((item) => item.length > 0);
    const totalCount = rawItems.length;

    let finalItems = rawItems;
    if (removeDuplicates) {
      finalItems = Array.from(new Set(rawItems));
    }

    let joinStr = "\n";
    if (delimiter === "comma") joinStr = ", ";
    else if (delimiter === "semicolon") joinStr = "; ";
    else if (delimiter === "space") joinStr = " ";
    else if (delimiter === "tab") joinStr = "\t";
    else if (delimiter === "custom") joinStr = customDelimiter || " ";

    return {
      items: finalItems,
      text: finalItems.join(joinStr),
      stats: {
        total: totalCount,
        unique: finalItems.length,
        removed: totalCount - finalItems.length,
      },
    };
  }, [inputText, delimiter, customDelimiter, removeDuplicates, onlyNumbers]);

  const handleCopy = async () => {
    if (!processedResult.text) return;
    try {
      await navigator.clipboard.writeText(processedResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (!processedResult.text) return;
    const blob = new Blob([processedResult.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcodes_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Заголовок модуля */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-gray-100 border border-gray-200 text-gray-700 text-xs font-mono font-medium px-2 py-0.5 rounded flex items-center gap-1.5">
            <Barcode className="h-3.5 w-3.5 text-gray-600" />
            Barcode Tool
          </span>
          <span className="text-xs text-gray-500 font-mono">Пакетная обработка</span>
        </div>
        <h1 className="text-xl font-medium text-gray-900">
          Выделитель ШК / Стикеров
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Нормализация, фильтрация, дедупликация и объединение штрихкодов из таблиц Excel, 1С и логов WMS.
        </p>
      </div>

      {/* Панель настроек разделителя и фильтрации */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Выбор разделителя */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 mr-1">
            Разделитель:
          </span>
          {[
            { id: "newline", label: "Новая строка (\\n)" },
            { id: "comma", label: "Запятая (,)" },
            { id: "semicolon", label: "Точка с запятой (;)" },
            { id: "space", label: "Пробел" },
            { id: "custom", label: "Свой" },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDelimiter(d.id)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                delimiter === d.id
                  ? "bg-gray-900 text-white border-gray-900 font-medium"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {d.label}
            </button>
          ))}

          {delimiter === "custom" && (
            <input
              type="text"
              value={customDelimiter}
              onChange={(e) => setCustomDelimiter(e.target.value)}
              placeholder="Символ"
              className="h-7 w-20 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Переключатели */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRemoveDuplicates(!removeDuplicates)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
              removeDuplicates
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {removeDuplicates ? "✓ Без дубликатов" : "С дубликатами"}
          </button>

          <button
            type="button"
            onClick={() => setOnlyNumbers(!onlyNumbers)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
              onlyNumbers
                ? "bg-blue-50 border-blue-300 text-blue-800 font-medium"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {onlyNumbers ? "✓ Только цифры (ШК)" : "Все символы"}
          </button>
        </div>
      </div>

      {/* Две колонки: Входные данные и Результат */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Исходные данные (Input) */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-mono font-medium text-gray-900">
                  Исходные данные (Raw Input)
                </span>
              </div>
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText("")}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Очистить</span>
                </button>
              )}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Вставьте сюда список штрихкодов, стикеров или скопированный столбец из Excel / 1С / WMS..."
              rows={13}
              className="mt-3 w-full resize-none rounded-md border border-gray-200 p-3 font-mono text-xs leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
            <span>Строк: {inputText ? inputText.split("\n").length : 0}</span>
            <span>Символов: {inputText.length}</span>
          </div>
        </div>

        {/* Результат обработки (Output) */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-medium text-gray-900">
                  Результат (Cleaned Output)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!processedResult.text}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>.TXT</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!processedResult.text}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-white" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-white" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={processedResult.text}
              placeholder="Здесь появятся отформатированные и очищенные штрихкоды..."
              rows={13}
              className="mt-3 w-full resize-none rounded-md border border-gray-200 bg-gray-50/50 p-3 font-mono text-xs leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none select-all"
            />
          </div>

          {/* Статистика обработки */}
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-gray-50 p-2.5 text-center border border-gray-200 font-mono text-xs">
            <div>
              <span className="text-gray-500">Всего: </span>
              <span className="font-semibold text-gray-900">{processedResult.stats.total}</span>
            </div>
            <div>
              <span className="text-gray-500">Уникальных: </span>
              <span className="font-semibold text-emerald-600">{processedResult.stats.unique}</span>
            </div>
            <div>
              <span className="text-gray-500">Дубликатов: </span>
              <span className="font-semibold text-blue-600">{processedResult.stats.removed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ APP ---
export default function App() {
  // Навигация: только 2 вкладки ("home" | "wrench")
  const [activeTab, setActiveTab] = useState<"home" | "wrench">("home");

  // Статусы и загрузка
  const [statuses, setStatuses] = useState<WMSStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Поиск
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Загрузка данных сразу при входе из жестко заданной константы DEFAULT_SHEETS_CSV_URL
  const loadGoogleSheetsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response: Response;
      try {
        response = await fetch(DEFAULT_SHEETS_CSV_URL);
      } catch {
        // Fallback через прокси при блокировке прямых CORS-запросов браузером
        response = await fetch("/api/statuses");
      }

      if (!response.ok) {
        throw new Error(`Ошибка HTTP при загрузке: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      let parsedItems: WMSStatusItem[] = [];

      if (contentType.includes("application/json")) {
        const json = await response.json();
        if (Array.isArray(json.statuses)) {
          parsedItems = json.statuses.map(
            (
              s: {
                id?: string;
                code?: string;
                category?: string;
                description?: string;
                action?: string;
              },
              idx: number
            ) => ({
              id: s.id || `wms-${idx}`,
              code: (s.code || "").replace(/^#/, ""),
              category:
                s.category ||
                detectCategory(s.code || "", s.description || "", s.action || ""),
              description: s.description || "Без названия",
              action: s.action || "Регламент отсутствует",
            })
          );
        }
      } else {
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
      const message =
        err instanceof Error
          ? err.message
          : "Не удалось загрузить данные из Google Таблицы";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Первичная загрузка без условий
  useEffect(() => {
    loadGoogleSheetsData();
  }, [loadGoogleSheetsData]);

  // Фильтрация статусов
  const filteredStatuses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return statuses;

    return statuses.filter((item) => {
      const matchCode = item.code.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAction = item.action.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchCode || matchDesc || matchAction || matchCat;
    });
  }, [searchQuery, statuses]);

  // Горячая клавиша '/'
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
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans antialiased overflow-hidden select-none">
      {/* 1. ЛЕВЫЙ SIDEBAR В СТИЛЕ CLOUDFLARE (bg-gray-50, border-r border-gray-200) */}
      <aside className="w-64 h-full flex flex-col justify-between bg-gray-50 border-r border-gray-200 shrink-0 z-20">
        <div>
          {/* Логотип Cloudflare + WMS Stats */}
          <div className="h-14 px-5 flex items-center gap-2.5 border-b border-gray-200 bg-white">
            <div className="w-6 h-6 rounded bg-[#f38020] text-white flex items-center justify-center shrink-0">
              <Cloud className="h-3.5 w-3.5 fill-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate leading-none">
                WMS Stats
              </span>
              <span className="text-[11px] text-gray-500 truncate mt-0.5">
                Cloudflare Console
              </span>
            </div>
          </div>

          {/* Меню с текстовыми пунктами и маленькими серыми иконками */}
          <div className="p-3 space-y-1">
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Навигация
            </div>

            {/* Вкладка: База статусов (Home) */}
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === "home"
                  ? "bg-gray-200 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
              }`}
            >
              <Home className="h-4 w-4 shrink-0 text-gray-500" />
              <span>База статусов</span>
            </button>

            {/* Вкладка: Инструменты (Wrench) */}
            <button
              type="button"
              onClick={() => setActiveTab("wrench")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === "wrench"
                  ? "bg-gray-200 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
              }`}
            >
              <Wrench className="h-4 w-4 shrink-0 text-gray-500" />
              <span>Инструменты</span>
            </button>
          </div>
        </div>

        {/* Нижний статус-бар сайдбара */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-gray-700 font-sans font-medium">Workers: Active</span>
            </div>
            <span className="text-[10px] text-gray-400">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* 2. ГЛАВНАЯ ОБЛАСТЬ (100% ПЛОСКИЙ СВЕТЛЫЙ ДИЗАЙН) */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-white">
        {/* ВЕРХНЯЯ ШАПКА (HEADER): bg-white, border-b border-gray-200 */}
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          {/* Хлебные крошки */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer">База знаний</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900 font-medium">
              {activeTab === "home" ? "Регламенты WMS" : "Выделитель ШК / Стикеров"}
            </span>
          </div>

          {/* Правая часть: статус синхронизации и обновление */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden sm:inline">Синхронизировано</span>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loadGoogleSheetsData()}
              title="Обновить таблицу"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin text-[#f38020]" : ""}`} />
              <span className="hidden sm:inline">Обновить</span>
            </button>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ (СКРОЛЛИРУЕМЫЙ) */}
        <main
          ref={setScrollParent}
          className="flex-1 overflow-y-auto w-full bg-white p-6 md:p-8"
        >
          {/* ВКЛАДКА 1: ИНСТРУМЕНТЫ — ПОЛНОСТЬЮ РАБОЧИЙ ВЫДЕЛИТЕЛЬ ШК / СТИКЕРОВ */}
          {activeTab === "wrench" && <BarcodeSeparatorTool />}

          {/* ВКЛАДКА 2: БАЗА СТАТУСОВ (HOME) */}
          {activeTab === "home" && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Заголовок страницы */}
              <div>
                <h1 className="text-xl font-medium text-gray-900">
                  Регламенты и статусы WMS
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Справочник складских процессов и регламентов выполнения операций.
                </p>
              </div>

              {/* Поиск: белый инпут, серая рамка border-gray-300, выравнивание по левому краю */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 max-w-md w-full focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                  <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по коду статуса или описанию..."
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />

                  {isSearchActive ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        inputRef.current?.focus();
                      }}
                      className="p-0.5 rounded text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                      title="Очистить"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center justify-center bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 text-[10px] font-mono border border-gray-200 shrink-0 select-none">
                      /
                    </kbd>
                  )}
                </div>

                {/* Счетчик записей и сброс */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    Показано:{" "}
                    <b className="text-gray-900 font-mono">{filteredStatuses.length}</b> из{" "}
                    <span className="font-mono">{statuses.length}</span>
                  </span>

                  {isSearchActive && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Сбросить</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Баннер ошибки при сбое загрузки */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3.5 flex items-center justify-between text-xs text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadGoogleSheetsData()}
                    className="underline hover:text-red-900 shrink-0 ml-3 font-medium"
                  >
                    Повторить
                  </button>
                </div>
              )}

              {/* Виртуализированный список карточек (VirtuosoGrid) */}
              {filteredStatuses.length > 0 ? (
                <div className="w-full">
                  <VirtuosoGrid
                    customScrollParent={scrollParent || undefined}
                    data={filteredStatuses}
                    totalCount={filteredStatuses.length}
                    overscan={200}
                    components={gridComponents}
                    itemContent={(_idx, item) => <StatusCard key={item.id} item={item} />}
                  />
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Ничего не найдено
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    По запросу &laquo;{searchQuery}&raquo; записи отсутствуют. Проверьте правильность написания кода.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-3 py-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors"
                  >
                    Сбросить фильтр
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
