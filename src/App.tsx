"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home,
  FileText,
  Wrench,
  Box,
  Settings,
  Search,
  Copy,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";

// --- TYPES ---
export interface WMSStatusItem {
  id: string;
  code: string;
  category: string;
  description: string;
  action: string;
}

// --- 500 ITEMS MOCK DATA GENERATOR ---
const BASE_CATEGORIES = [
  "Приемка",
  "Раскладка и МХ",
  "Сборка",
  "Упаковка",
  "Сортировка и Отгрузка",
  "Перемещение",
  "Инвентаризация",
  "Брак и Проблемы",
  "Возвраты",
];

const SEED_PREFIXES = [
  "AIP", "ASP", "RCV", "APR", "BRK", "UNL", "PLC", "STR", "BIN", "ZON",
  "PIK", "COL", "BAT", "WAV", "PAK", "BOX", "TAP", "WRP", "SRT", "DIS",
  "SHP", "GTE", "DCK", "MOV", "PAL", "FRK", "LFT", "INV", "CNT", "AUD",
  "DEF", "DMG", "WRG", "LST", "RTN", "REF", "PVZ", "TRN", "EXP", "TST",
];

const SAMPLE_OPERATIONS = [
  { desc: "Приемка с упаковкой товара", action: "Принять грузоместо, проверить целостность упаковки, доупаковать в сейф-пакет и отсканировать ШК ячейки стола.", cat: "Приемка" },
  { desc: "Приемка стандартного моно-паллета", action: "Сверить накладную с фактическим количеством коробов, наклеить паллетный ярлык и передать в зону раскладки.", cat: "Приемка" },
  { desc: "Первичная выгрузка из фуры", action: "Разгрузить паллеты в буферную зону ворот, проставить отметку о прибытии рейса в ТСД.", cat: "Приемка" },
  { desc: "Приемка крупногабаритного груза (КГТ)", action: "Зафиксировать габариты лазерным дальномером, разместить на напольном хранении КГТ.", cat: "Приемка" },
  { desc: "Размещение товара в мезонинную ячейку", action: "Отсканировать ШК товара, отсканировать ШК ячейки стеллажа, подтвердить фактическое количество.", cat: "Раскладка и МХ" },
  { desc: "Пополнение зоны активного отбора", action: "Переместить целый короб из зоны резерва верхнего яруса в нижний ярус отбора (Pick-zone).", cat: "Раскладка и МХ" },
  { desc: "Консолидация ячеек хранения", action: "Объединить неполные остатки одного SKU из смежных ячеек в одну ячейку с обязательным пересчетом.", cat: "Раскладка и МХ" },
  { desc: "Волновой отбор клиентских заказов", action: "Собрать волну заказов по оптимизированному маршруту ТСД в тележку отбора.", cat: "Сборка" },
  { desc: "Срочный штучный отбор (Fast-Track)", action: "Немедленно отсканировать товар с высшим приоритетом и доставить на экспресс-упаковку.", cat: "Сборка" },
  { desc: "Сборка мультизаказа с проверкой серии", action: "Сверить серийный номер каждого вложения с заданием ТСД перед укладкой в лоток.", cat: "Сборка" },
  { desc: "Контрольное взвешивание и упаковка", action: "Установить собранный лоток на весы, проверить дельту веса, упаковать в картонный короб и запечатать скотчем.", cat: "Упаковка" },
  { desc: "Упаковка хрупких отправлений (Glass/Fragile)", action: "Обернуть в 3 слоя воздушно-пузырьковой пленки, зафиксировать наполнителем, наклеить маркер «Осторожно хрупкое».", cat: "Упаковка" },
  { desc: "Вложение промо-материалов", action: "Добавить обязательный рекламный буклет акции в соответствии с артикулом заказа.", cat: "Упаковка" },
  { desc: "Сортировка посылок по направлениям СЦ", action: "Отсканировать адресный ярлык на сортировочной линии и сбросить в рукав соответствующего СЦ.", cat: "Сортировка и Отгрузка" },
  { desc: "Формирование транспортной паллеты", action: "Уложить короба на поддон с перевязкой стрейч-пленкой, прикрепить транспортную накладную рейса.", cat: "Сортировка и Отгрузка" },
  { desc: "Финальная отгрузка в магистральный тягач", action: "Проверить пломбу на воротах, отсканировать штрихкод путевого листа водителя и подтвердить погрузку.", cat: "Сортировка и Отгрузка" },
  { desc: "Межскладское перемещение тары", action: "Собрать оборотную пластиковую тару и оформить акт перемещения на центральный хаб.", cat: "Перемещение" },
  { desc: "Внутрискладское перемещение высотным ричтраком", action: "Снять паллету с 5-го яруса и переместить в зону комплектации негабарита.", cat: "Перемещение" },
  { desc: "Циклическая инвентаризация по расписанию", action: "Пересчитать все SKU в заданной ячейке без блокировки смежных операций.", cat: "Инвентаризация" },
  { desc: "Полная сплошная ревизия сектора", action: "Заблокировать сектор стеллажей, отсканировать каждый индивидуальный штрихкод до нулевого расхождения.", cat: "Инвентаризация" },
  { desc: "Фиксация фабричного брака поставщика", action: "Сфотографировать повреждение через камеру ТСД, перевести статус в Некондиция и отправить на карантин.", cat: "Брак и Проблемы" },
  { desc: "Выявление пересорта по размерной сетке", action: "Зафиксировать несоответствие маркировки на бирке и коробке, составить акт расхождения ТОРГ-2.", cat: "Брак и Проблемы" },
  { desc: "Обработка клиентского возврата с ПВЗ", action: "Проверить сохранность заводских пломб, провести визуальный осмотр и оформить возврат на баланс.", cat: "Возвраты" },
  { desc: "Возврат ошибочно доставленного отправления", action: "Отсканировать возвратную накладную, вернуть товар в зону повторной сортировки.", cat: "Возвраты" },
];

function generateMockData(count = 500): WMSStatusItem[] {
  const items: WMSStatusItem[] = [];

  for (let i = 0; i < count; i++) {
    const seed = SAMPLE_OPERATIONS[i % SAMPLE_OPERATIONS.length];
    const prefix = SEED_PREFIXES[i % SEED_PREFIXES.length];
    const num = String(Math.floor(i / SEED_PREFIXES.length) + 1).padStart(2, "0");
    const code = `${prefix}${num === "01" ? "" : num}`;

    items.push({
      id: `wms-${i + 1}`,
      code: code,
      category: seed.cat || BASE_CATEGORIES[i % BASE_CATEGORIES.length],
      description: i >= SAMPLE_OPERATIONS.length ? `${seed.desc} (Секция ${String.fromCharCode(65 + (i % 6))}-${(i % 18) + 1})` : seed.desc,
      action: i >= SAMPLE_OPERATIONS.length ? `${seed.action} [Регламент WMS-v${(i % 5) + 1}.${i % 9}]` : seed.action,
    });
  }

  return items;
}

const STATIC_500_DATA: WMSStatusItem[] = generateMockData(500);

// --- COMPONENT: STATUS CARD (LINEAR / VERCEL STYLE) ---
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
    <div className="group rounded-2xl bg-[#0f0f13] border border-zinc-800/60 hover:bg-zinc-900/80 hover:border-zinc-700 transition-colors duration-200 p-5 flex flex-col justify-between h-full min-h-[160px]">
      <div>
        {/* Top row: #ID + small copy icon (left), pill category badge (right) */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-fuchsia-400 font-mono font-semibold text-xl tracking-wide">
              #{item.code}
            </span>

            {/* Compact copy icon: visible on hover */}
            <button
              type="button"
              onClick={handleCopy}
              title="Копировать статус"
              className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-150"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Category pill badge */}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 whitespace-nowrap shrink-0">
            {item.category}
          </span>
        </div>

        {/* Operation title */}
        <p className="text-sm font-medium text-zinc-200 mb-2 leading-snug">
          {item.description}
        </p>

        {/* Regulation description (clean, non-terminal text) */}
        <p className="text-xs text-zinc-400 leading-relaxed font-normal">
          {item.action}
        </p>
      </div>
    </div>
  );
});
StatusCard.displayName = "StatusCard";

// Virtuoso Grid layout configuration with max-w-5xl and clean gap
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
  const [activeTab, setActiveTab] = useState<"home" | "docs" | "tools" | "box" | "settings">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filtered statuses
  const filteredStatuses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return STATIC_500_DATA.filter((item) => {
      const matchCode = item.code.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAction = item.action.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchCode || matchDesc || matchAction || matchCat;
    });
  }, [searchQuery]);

  // Global '/' shortcut to focus search input
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
      {/* 1. SIDEBAR (RAYCAST / LINEAR DARK STYLE) */}
      <aside className="w-16 h-full flex flex-col justify-between items-center py-6 bg-[#09090b] border-r border-zinc-800/50 shrink-0 z-20">
        {/* Top icons: Home, FileText, Wrench, Box */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("home");
              setSearchQuery("");
            }}
            title="Главная"
            className={`p-3 rounded-xl transition-all duration-150 ${
              activeTab === "home"
                ? "bg-zinc-800/60 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
            }`}
          >
            <Home className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            title="Регламенты"
            className={`p-3 rounded-xl transition-all duration-150 ${
              activeTab === "docs"
                ? "bg-zinc-800/60 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
            }`}
          >
            <FileText className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tools")}
            title="Инструменты"
            className={`p-3 rounded-xl transition-all duration-150 ${
              activeTab === "tools"
                ? "bg-zinc-800/60 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
            }`}
          >
            <Wrench className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("box")}
            title="Складские операции"
            className={`p-3 rounded-xl transition-all duration-150 ${
              activeTab === "box"
                ? "bg-zinc-800/60 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
            }`}
          >
            <Box className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom icon: Settings */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            title="Настройки"
            className={`p-3 rounded-xl transition-all duration-150 ${
              activeTab === "settings"
                ? "bg-zinc-800/60 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
            }`}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN COLUMN (NO HEADER, ABSOLUTELY CLEAN TOP-RIGHT) */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden relative">
        {/* 3. SCROLLABLE CONTENT AREA */}
        <main ref={setScrollParent} className="flex-1 overflow-y-auto relative w-full">
          {activeTab === "settings" ? (
            /* Settings Tab View */
            <div className="max-w-3xl mx-auto px-6 py-12">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <Settings className="h-5 w-5 text-zinc-300" />
                  <h2 className="text-lg font-bold text-zinc-100">Настройки системы</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Вернуться к поиску
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#0f0f13] border border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Виртуализация списка (react-virtuoso)</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Лимит 15–20 карточек в DOM для обеспечения стабильных 60 FPS</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Активно
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f0f13] border border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">База данных статусов</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">500 актуальных регламентов склада в локальной реплике</p>
                  </div>
                  <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700">
                    500 записей
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f0f13] border border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Тема оформления</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Dark Mode в стиле продуктов Linear, Raycast и Vercel</p>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                    Dark Linear
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Main Search and Statuses View */
            <div
              className={`max-w-5xl mx-auto w-full px-4 sm:px-6 transition-all duration-500 ease-out flex flex-col ${
                isSearchActive ? "pt-8" : "pt-[30vh]"
              }`}
            >
              {/* Modern Search Bar (Linear / Raycast Style) */}
              <div className="w-full">
                <div className="relative flex items-center rounded-2xl bg-zinc-900/80 border border-zinc-800 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/30 py-4 px-6 transition-all duration-200">
                  {/* Magnifier icon: larger, text-zinc-500 */}
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

                {/* Subtitle helper text: modern sans-serif, text-zinc-500, text-sm, text-center mt-4 */}
                {!isSearchActive && (
                  <p className="text-center text-sm text-zinc-500 font-sans mt-4 transition-opacity duration-300">
                    Введите код статуса (например, <span className="text-zinc-400 font-medium">AIP</span>, <span className="text-zinc-400 font-medium">ASP</span>) или название операции
                  </p>
                )}
              </div>

              {/* Status info bar right below search when active */}
              {isSearchActive && (
                <div className="w-full py-3 my-2 flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/40">
                  <span>
                    Найдено регламентов: <span className="text-zinc-200 font-medium">{filteredStatuses.length}</span> из 500
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

              {/* Filtered Cards List (React Virtuoso) - ONLY shown when searching */}
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
