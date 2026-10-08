"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Menu,
  X,
  Home,
  Wrench,
  Search,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Trash2,
  Download,
  Barcode,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Papa from "papaparse";

// --- ТИПЫ ДАННЫХ ---
export interface WMSStatusItem {
  id: string;
  code: string;
  category: string;
  description: string;
}

// Жестко заданная публичная ссылка на Google Таблицу (Published to web CSV)
const DEFAULT_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLvAMU_aedXIh-bIf8WfGBFDG-E2yBCh1MQ4SvyDgGznfRp0lotEnqWsf8EQi8lzIptoMJqgHrsbdv/pub?gid=0&single=true&output=csv";

// Определение категории в случае нестандартных колонок
function detectCategory(code: string, desc: string, action: string): string {
  const text = `${code} ${desc} ${action}`.toLowerCase();
  if (
    text.includes("приемк") ||
    text.includes("приёмк") ||
    code.startsWith("AI") ||
    code.startsWith("AS") ||
    code.startsWith("RCV") ||
    code.startsWith("APR") ||
    code.startsWith("WI") ||
    code.startsWith("PB")
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
    text.includes("паллет") ||
    code.startsWith("MOV") ||
    code.startsWith("PAL") ||
    code.startsWith("LP")
  ) {
    return "Перемещение";
  }
  if (
    text.includes("инвентар") ||
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
    text.includes("карантин") ||
    code.startsWith("DEF") ||
    code.startsWith("DMG")
  ) {
    return "Брак и Проблемы";
  }
  if (text.includes("возврат") || code.startsWith("RTN") || code.startsWith("REF")) {
    return "Возвраты";
  }
  return "Складской процесс";
}

// Резервные статусы (на случай потери соединения с таблицей)
const FALLBACK_STATUSES: WMSStatusItem[] = [
  {
    id: "f-1",
    code: "AIP",
    category: "Приемка с упаковкой",
    description:
      "Приемка товара + доупаковка на столе приемки (пример: красота в слюде доупаковывается в пупырку и короб)",
  },
  {
    id: "f-2",
    code: "ASP",
    category: "Упаковка дорогой вещи на приемке",
    description: "Упаковка дорогой вещи при приемке товара сотрудником склада",
  },
  {
    id: "f-3",
    code: "LPB",
    category: "Перемещение паллет",
    description: "Перемещение МОНОпаллет грузчиком на другое МХ хранения",
  },
  {
    id: "f-4",
    code: "LPR",
    category: "Перемещение паллет карщиком",
    description: "Перемещение МОНОпаллет карщиком на высотные ячейки хранения",
  },
  {
    id: "f-5",
    code: "PBI",
    category: "Паллетная приемка",
    description: "Приемка на воротах Моно паллет по виртуальным ШК",
  },
  {
    id: "f-6",
    code: "WIJ",
    category: "Приемка по предраспечатанным ШК",
    description:
      "Приемка товара от поставщика FBO на столах сотрудниками через планшет или ТСД и проверка товара",
  },
  {
    id: "f-7",
    code: "WIW",
    category: "Приемка сеткой",
    description:
      "Первичный статус. Проставляется при выгрузке поступлений от поставщика в контейнерах",
  },
  {
    id: "f-8",
    code: "WSC",
    category: "Оприходование при смене характеристики",
    description:
      "Виртуальная смена номенклатуры товара на нужную карточку продавца в случае пересорта в поставке",
  },
];

// Быстрые подсказки-теги
const POPULAR_TAGS = ["#AIP", "#ASP", "#LPB", "#WIJ", "Приемка", "Упаковка", "Паллет"];

// --- КАРТОЧКА СТАТУСА ---
function StatusCard({
  item,
  animationIndex = 0,
}: {
  item: WMSStatusItem;
  animationIndex?: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`#${item.code} — ${item.category}: ${item.description}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{ animationDelay: `${animationIndex * 50}ms` }}
      className="animate-fade-in-up group relative bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5"
    >
      <div>
        {/* Верхняя строка: код статуса крупным шрифтом + кнопка копирования */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-extrabold tracking-wide bg-gradient-to-r from-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              #{item.code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Скопировать регламент"
            className="p-2 rounded-xl border border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-100 hover:bg-slate-800 hover:border-slate-700 transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Категория: крупный жирный заголовок */}
        <h3 className="text-xl font-semibold text-slate-100 mt-4 leading-snug">
          {item.category}
        </h3>

        {/* Описание: читаемый текст среднего размера */}
        <p className="text-base text-slate-400 mt-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Нижняя декоративная тонкая плашка */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>WMS Status</span>
        <span className="group-hover:text-fuchsia-400 transition-colors flex items-center gap-1">
          Регламент <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

// --- ВКЛАДКА: ИНСТРУМЕНТ "ВЫДЕЛИТЕЛЬ ШК / СТИКЕРА" ---
function BarcodeHighlighterTool() {
  const [inputText, setInputText] = useState("");
  const [delimiter, setDelimiter] = useState<string>("newline");
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [onlyNumbers, setOnlyNumbers] = useState(false);
  const [resultText, setResultText] = useState("");
  const [stats, setStats] = useState({ total: 0, unique: 0, duplicates: 0 });
  const [copied, setCopied] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const handleProcess = () => {
    if (!inputText.trim()) {
      setResultText("");
      setStats({ total: 0, unique: 0, duplicates: 0 });
      setHasProcessed(true);
      return;
    }

    const tokens = inputText
      .split(/[\r\n,;\t|\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const extracted: string[] = [];

    tokens.forEach((token) => {
      const cleaned = token.replace(/^[«"'({\[]+|[»"')}\].,;:]+$/g, "").trim();
      if (!cleaned) return;

      if (onlyNumbers) {
        const numberMatches = cleaned.match(/\b\d{4,24}\b/g);
        if (numberMatches) {
          extracted.push(...numberMatches);
        } else {
          const digitsOnly = cleaned.replace(/\D/g, "");
          if (digitsOnly.length >= 4) {
            extracted.push(digitsOnly);
          }
        }
      } else {
        if (/^[A-Za-z0-9_\-#]{4,32}$/.test(cleaned) || /\d{6,}/.test(cleaned)) {
          extracted.push(cleaned);
        } else {
          extracted.push(cleaned);
        }
      }
    });

    const totalCount = extracted.length;
    let finalItems = extracted;

    if (removeDuplicates) {
      finalItems = Array.from(new Set(extracted));
    }

    let joinSymbol = "\n";
    if (delimiter === "comma") joinSymbol = ", ";
    else if (delimiter === "semicolon") joinSymbol = "; ";
    else if (delimiter === "space") joinSymbol = " ";

    const formattedOutput = finalItems.join(joinSymbol);

    setResultText(formattedOutput);
    setStats({
      total: totalCount,
      unique: finalItems.length,
      duplicates: totalCount - finalItems.length,
    });
    setHasProcessed(true);
  };

  const handleCopyResult = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  const handleDownloadResult = () => {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `barcodes_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pt-4">
      {/* Заголовок */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-slate-800/80 border border-slate-700/80 text-fuchsia-400 text-xs font-mono px-3 py-1 rounded-xl flex items-center gap-1.5 font-medium">
            <Barcode className="h-3.5 w-3.5" />
            WMS Utility
          </span>
          <span className="text-xs text-slate-400">Пакетный разбор штрихкодов</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          Выделитель ШК / Стикера
        </h1>
        <p className="text-base text-slate-400 mt-1">
          Быстрое извлечение, нормализация, дедупликация и объединение штрихкодов и стикеров из таблиц Excel, 1С и логов WMS.
        </p>
      </div>

      {/* Карточка инструмента */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Панель параметров */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">
              Разделитель вывода:
            </span>
            {[
              { id: "newline", label: "Новая строка" },
              { id: "comma", label: "Запятая (,)" },
              { id: "semicolon", label: "Точка с запятой (;)" },
              { id: "space", label: "Пробел" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDelimiter(opt.id)}
                className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                  delimiter === opt.id
                    ? "bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white border-transparent font-medium"
                    : "bg-slate-800/50 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="rounded-md border-slate-700 bg-slate-800 text-fuchsia-500 focus:ring-0"
              />
              Без дубликатов
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyNumbers}
                onChange={(e) => setOnlyNumbers(e.target.checked)}
                className="rounded-md border-slate-700 bg-slate-800 text-fuchsia-500 focus:ring-0"
              />
              Только цифры
            </label>
          </div>
        </div>

        {/* Сетка: Ввод и Вывод */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Поле ввода */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Исходный текст / Лог
              </label>
              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText("");
                    setResultText("");
                    setHasProcessed(false);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Очистить
                </button>
              )}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Вставьте сюда список штрихкодов, стикеров, столбец из Excel или логов WMS..."
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500 resize-none leading-relaxed transition-colors"
            />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Строк: {inputText ? inputText.split("\n").length : 0} | Символов: {inputText.length}
              </span>

              {/* Кнопка "Обработать" с WB-градиентом */}
              <button
                type="button"
                onClick={handleProcess}
                className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:opacity-90 active:scale-98 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Barcode className="h-4 w-4" />
                Обработать
              </button>
            </div>
          </div>

          {/* Блок для вывода результата */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Результат обработки
              </label>

              {resultText && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadResult}
                    title="Скачать .TXT"
                    className="p-1 px-2.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    TXT
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="p-1 px-3 text-xs bg-slate-100 text-slate-900 rounded-lg hover:bg-white flex items-center gap-1 transition-colors font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Копировать
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <textarea
              readOnly
              value={resultText}
              placeholder={
                hasProcessed
                  ? "Штрихкоды не найдены в исходном тексте."
                  : "Здесь появится очищенный и отформатированный список после нажатия кнопки «Обработать»..."
              }
              rows={12}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed select-all"
            />

            {/* Статистика обработки */}
            <div className="mt-4 grid grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-center text-xs font-mono">
              <div>
                <span className="text-slate-500">Всего: </span>
                <span className="font-bold text-slate-200">{stats.total}</span>
              </div>
              <div>
                <span className="text-slate-500">Уникальных: </span>
                <span className="font-bold text-emerald-400">{stats.unique}</span>
              </div>
              <div>
                <span className="text-slate-500">Дубликатов: </span>
                <span className="font-bold text-fuchsia-400">{stats.duplicates}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ГЛАВНЫЙ КОМПОНЕНТ APP ---
export default function App() {
  // Выезжающий сайдбар: скрыт по умолчанию
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Навигация: только 2 вкладки ("home" | "tools")
  const [activeTab, setActiveTab] = useState<"home" | "tools">("home");

  // Статусы и загрузка данных
  const [statuses, setStatuses] = useState<WMSStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Поиск и пагинация
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(4);

  // Стабильный ref на поисковый инпут
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Сброс лимита до 4 при вводе
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setLimit(4);
  };

  // Загрузка данных через fetch и PapaParse
  const fetchStatuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let csvContent = "";

      try {
        const response = await fetch(DEFAULT_SHEETS_CSV_URL);
        if (response.ok) {
          csvContent = await response.text();
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch {
        // Fallback через серверный роут
        try {
          const proxyRes = await fetch("/api/statuses");
          if (proxyRes.ok) {
            const data = await proxyRes.json();
            if (Array.isArray(data.statuses) && data.statuses.length > 0) {
              setStatuses(
                data.statuses.map(
                  (
                    s: {
                      code?: string;
                      category?: string;
                      description?: string;
                      action?: string;
                    },
                    i: number
                  ) => ({
                    id: `proxy-${i}`,
                    code: (s.code || "").replace(/^#/, "").trim(),
                    category: s.category || s.description || "Регламент WMS",
                    description: s.action || s.description || "Описание регламента",
                  })
                )
              );
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // fallback
        }
      }

      if (!csvContent) {
        setStatuses(FALLBACK_STATUSES);
        setIsLoading(false);
        return;
      }

      const parsed = Papa.parse<Record<string, string>>(csvContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (!parsed.data || parsed.data.length === 0) {
        setStatuses(FALLBACK_STATUSES);
        setIsLoading(false);
        return;
      }

      const items: WMSStatusItem[] = parsed.data
        .map((row, idx) => {
          const rawCode = (
            row["Статус"] ||
            row["Код"] ||
            row["Код (статус)"] ||
            row["Code"] ||
            row["status"] ||
            Object.values(row)[0] ||
            ""
          ).trim();

          const code = rawCode.replace(/^#/, "");
          const hasExplicitCategory = Boolean(row["Категория"] || row["Category"]);
          let category = "";
          let description = "";

          if (hasExplicitCategory) {
            category = (row["Категория"] || row["Category"] || "").trim();
            description = (
              row["Описание"] ||
              row["Description"] ||
              row["Совершаемые действия"] ||
              ""
            ).trim();
          } else {
            const col2 = (
              row["Описание"] ||
              row["Description"] ||
              Object.values(row)[1] ||
              ""
            ).trim();
            const col3 = (
              row["Совершаемые действия"] ||
              row["Действия"] ||
              Object.values(row)[2] ||
              ""
            ).trim();

            if (col2 && col3) {
              category = col2;
              description = col3;
            } else if (col2) {
              category = detectCategory(code, col2, "");
              description = col2;
            } else {
              category = detectCategory(code, "", "");
              description = "Описание регламента не указано";
            }
          }

          if (!code && !category && !description) return null;

          return {
            id: `row-${idx}-${code}`,
            code: code || `ID-${idx + 1}`,
            category: category || "Регламент WMS",
            description: description || "Описание процесса",
          };
        })
        .filter(Boolean) as WMSStatusItem[];

      if (items.length > 0) {
        setStatuses(items);
      } else {
        setStatuses(FALLBACK_STATUSES);
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      setError("Не удалось загрузить данные из Google Таблицы. Показаны резервные регламенты.");
      setStatuses(FALLBACK_STATUSES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Флаг активности поиска
  const isSearchActive = searchQuery.trim().length > 0;

  // ЛОГИКА ПОИСКА:
  // 1. Если поиск пуст -> список пуст (карточек нет).
  // 2. Если точное совпадение по Коду (например "AIP" или "#AIP") -> выводим ТОЛЬКО 1 карточку.
  // 3. Если частичное совпадение -> фильтруем совпадения.
  const filteredStatuses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const qCode = q.replace(/^#/, "");

    // Точное совпадение по Коду
    const exactCodeMatch = statuses.find(
      (item) => item.code.toLowerCase().replace(/^#/, "") === qCode
    );

    if (exactCodeMatch) {
      return [exactCodeMatch];
    }

    // Частичное совпадение по слову в описании, категории или коде
    return statuses.filter((item) => {
      const itemCode = item.code.toLowerCase().replace(/^#/, "");
      const itemCat = item.category.toLowerCase();
      const itemDesc = item.description.toLowerCase();

      return (
        itemCode.includes(qCode) ||
        itemCat.includes(q) ||
        itemDesc.includes(q)
      );
    });
  }, [searchQuery, statuses]);

  // Срез по лимиту (максимум 4 на старте)
  const displayedStatuses = useMemo(() => {
    return filteredStatuses.slice(0, limit);
  }, [filteredStatuses, limit]);

  const hasMore = filteredStatuses.length > limit;

  // Горячая клавиша '/' и Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
        } else if (document.activeElement === searchInputRef.current) {
          handleSearchChange("");
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden select-none">
      {/* 1. ПОЛУПРОЗРАЧНЫЙ BACKDROP ДЛЯ ВЫЕЗЖАЮЩЕГО САЙДБАРА */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* 2. ВЫЕЗЖАЮЩИЙ САЙДБАР (Off-canvas) - скрыт за левым краем (-translate-x-full) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Шапка меню */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              {/* Фирменная иконка с градиентом fuchsia to orange */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                W
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-slate-100 truncate leading-none">
                  WMS Dashboard
                </span>
                <span className="text-xs text-slate-400 truncate mt-1">
                  База регламентов
                </span>
              </div>
            </div>

            {/* Кнопка закрытия сайдбара */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Закрыть меню"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Пункты меню: ДВЕ вкладки ("База статусов" и "Инструменты") */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Навигация
            </div>

            {/* Вкладка 1: База статусов */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("home");
                setIsSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3.5 px-3.5 py-3 text-sm rounded-xl transition-all ${
                activeTab === "home"
                  ? "bg-slate-800 text-slate-100 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              {/* Градиентный индикатор активной вкладки */}
              {activeTab === "home" && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-gradient-to-b from-fuchsia-500 to-orange-500" />
              )}
              <Home className={`h-4 w-4 shrink-0 ${activeTab === "home" ? "text-fuchsia-400" : "text-slate-500"}`} />
              <span>База статусов</span>
            </button>

            {/* Вкладка 2: Инструменты */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("tools");
                setIsSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3.5 px-3.5 py-3 text-sm rounded-xl transition-all ${
                activeTab === "tools"
                  ? "bg-slate-800 text-slate-100 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              {activeTab === "tools" && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-gradient-to-b from-fuchsia-500 to-orange-500" />
              )}
              <Wrench className={`h-4 w-4 shrink-0 ${activeTab === "tools" ? "text-fuchsia-400" : "text-slate-500"}`} />
              <span>Инструменты</span>
            </button>
          </nav>
        </div>

        {/* Футер сайдбара */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Синхронизировано</span>
            </div>
            <span className="font-mono text-slate-500">{statuses.length} статусов</span>
          </div>
        </div>
      </aside>

      {/* 3. ОСНОВНАЯ ЧАСТЬ ЭКРАНА */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* ШАПКА (Header) */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          {/* Слева: кнопка "Бургер" и текстовый заголовок */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-fuchsia-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                W
              </div>
              <span className="text-sm sm:text-base font-semibold text-slate-100">
                База знаний / Регламенты WMS
              </span>
            </div>
          </div>

          {/* Справа: кнопка обновления данных */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fetchStatuses()}
              title="Обновить таблицу из Google Sheets"
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-fuchsia-400" : ""}`} />
            </button>
          </div>
        </header>

        {/* ГЛАВНАЯ СКРОЛЛИРУЕМАЯ ОБЛАСТЬ */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-950">
          {/* ВКЛАДКА: ИНСТРУМЕНТЫ */}
          {activeTab === "tools" && <BarcodeHighlighterTool />}

          {/* ВКЛАДКА: БАЗА СТАТУСОВ (ДИНАМИЧЕСКИЙ ЛЕЙАУТ БЕЗ ПЕРЕМОНТИРОВАНИЯ ИНПУТА) */}
          {activeTab === "home" && (
            <div className="w-full">
              {/* Баннер ошибки при сбое загрузки */}
              {error && (
                <div className="max-w-4xl mx-auto mb-6 bg-rose-950/40 border border-rose-900/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchStatuses()}
                    className="underline font-medium hover:text-rose-100 ml-2"
                  >
                    Повторить
                  </button>
                </div>
              )}

              {/* 
                СТАБИЛЬНЫЙ КОНТЕЙНЕР ПОИСКА:
                Один постоянный инпут в дереве React!
                Плавный transition на отступах и ширине:
                - Когда поиск пуст: центрирован посередине экрана (pt-24 sm:pt-32 pb-8 max-w-2xl)
                - Когда введен текст: плавно смещается в верхнюю часть экрана (pt-2 pb-6 max-w-6xl)
              */}
              <div
                className={`mx-auto transition-all duration-300 ease-out ${
                  isSearchActive
                    ? "pt-2 pb-6 max-w-6xl"
                    : "pt-20 sm:pt-28 pb-8 max-w-2xl text-center"
                }`}
              >
                {/* Брендовый заголовок в начальном состоянии (плавно скрывается/схлопывается) */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isSearchActive ? "max-h-0 opacity-0 pointer-events-none mb-0" : "max-h-60 opacity-100 mb-6"
                  }`}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-900/80 text-xs text-slate-300 mb-4">
                    <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                    <span className="font-medium">Корпоративная база регламентов</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                    Поиск по статусам WMS
                  </h1>
                </div>

                {/* 
                  СТРОКА ПОИСКА:
                  rounded-2xl, градиентный hover/focus glow, стабильный инпут!
                */}
                <div className="relative group">
                  {/* Градиентная подложка-рамка (active glow) */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-fuchsia-500/20 via-slate-800 to-orange-500/20 rounded-2xl group-hover:from-fuchsia-500/40 group-hover:to-orange-500/40 group-focus-within:from-fuchsia-500 group-focus-within:to-orange-500 transition-all duration-300" />

                  {/* Внутренняя область строки поиска */}
                  <div className="relative flex items-center bg-slate-900 rounded-2xl px-5 py-4 border border-slate-800/80 group-focus-within:border-transparent transition-colors">
                    <Search className="h-5 w-5 text-slate-400 mr-3.5 shrink-0 group-focus-within:text-fuchsia-400 transition-colors" />

                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Введите код (например #AIP) или название операции..."
                      className="w-full bg-transparent text-base sm:text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />

                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleSearchChange("");
                          searchInputRef.current?.focus();
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
                        title="Очистить поиск"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <kbd className="hidden sm:inline-flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg px-2.5 py-1 text-xs font-mono border border-slate-700/80 shrink-0 select-none">
                        /
                      </kbd>
                    )}
                  </div>
                </div>

                {/* Аккуратная подсказка под строкой поиска в начальном состоянии */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isSearchActive ? "max-h-0 opacity-0 pointer-events-none mt-0" : "max-h-32 opacity-100 mt-4"
                  }`}
                >
                  <p className="text-sm text-slate-400">
                    Введите код или название операции...
                  </p>

                  {/* Быстрые кликабельные теги */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs text-slate-500 mr-1">
                      Популярные:
                    </span>
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          handleSearchChange(tag);
                          searchInputRef.current?.focus();
                        }}
                        className="px-3 py-1 text-xs rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-100 hover:border-slate-700 hover:bg-slate-800/80 transition-all font-mono"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Строка со счетчиком найденного при активном поиске */}
                {isSearchActive && (
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>
                      Результатов:{" "}
                      <b className="text-slate-100 font-mono text-sm">
                        {filteredStatuses.length}
                      </b>{" "}
                      из {statuses.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSearchChange("")}
                      className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                    >
                      Сбросить поиск
                    </button>
                  </div>
                )}
              </div>

              {/* 
                РЕЗУЛЬТАТЫ ПОИСКА:
                Отображаются ТОЛЬКО если введен текст (isSearchActive).
                Сетка: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6.
                Карточки плавно выезжают снизу вверх.
              */}
              {isSearchActive && (
                <div className="max-w-6xl mx-auto space-y-8">
                  {displayedStatuses.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {displayedStatuses.map((item, idx) => (
                          <StatusCard key={item.id} item={item} animationIndex={idx} />
                        ))}
                      </div>

                      {/* Кнопка "Показать еще (+4)" с градиентным бордером */}
                      {hasMore && (
                        <div className="flex justify-center pt-4 pb-12">
                          <button
                            type="button"
                            onClick={() => setLimit((prev) => prev + 4)}
                            className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:opacity-95 active:scale-98 transition-all"
                          >
                            <div className="px-6 py-3 rounded-[15px] bg-slate-900 text-slate-200 group-hover:bg-slate-900/80 transition-colors flex items-center gap-2.5 text-sm font-semibold">
                              <Layers className="h-4 w-4 text-fuchsia-400" />
                              <span>Показать еще (+4)</span>
                              <span className="text-xs text-slate-500 font-normal">
                                (осталось {filteredStatuses.length - limit})
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Ничего не найдено */
                    <div className="animate-fade-in-up bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto mt-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Search className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-100">
                        Ничего не найдено
                      </h3>
                      <p className="text-sm text-slate-400 mt-2">
                        По запросу &laquo;{searchQuery}&raquo; совпадений не обнаружено. Проверьте правильность кода (например, AIP) или введите другое слово.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSearchChange("")}
                        className="mt-5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        Очистить поиск
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
