"use client";

import React, { useState, useMemo } from "react";
import {
  Barcode,
  Copy,
  Check,
  Trash2,
  Download,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { AntigravityCanvas } from "@/components/AntigravityCanvas";
import { AntigravityProvider, useAntigravity } from "@/components/AntigravityContext";
import { Button } from "@/components/ui/button";

function SeparatorToolContent() {
  const [inputText, setInputText] = useState("");
  const [delimiter, setDelimiter] = useState<string>("newline");
  const [customDelimiter, setCustomDelimiter] = useState(",");
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [removeEmpty] = useState(true);
  const [trimWhitespace] = useState(true);
  const [onlyNumbers, setOnlyNumbers] = useState(false);
  const [copied, setCopied] = useState(false);
  const { hapticPulse } = useAntigravity();


  // Processing logic
  const processedResult = useMemo(() => {
    if (!inputText) return { items: [], text: "", stats: { total: 0, unique: 0, removed: 0 } };

    // Split input by lines, tabs, commas, spaces
    let rawItems = inputText
      .split(/[\r\n,;\t]+/)
      .map((item) => (trimWhitespace ? item.trim() : item));

    if (onlyNumbers) {
      rawItems = rawItems.map((item) => item.replace(/\D/g, "")).filter((item) => item.length > 0);
    }

    if (removeEmpty) {
      rawItems = rawItems.filter((item) => item.length > 0);
    }

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
  }, [inputText, delimiter, customDelimiter, removeDuplicates, removeEmpty, trimWhitespace, onlyNumbers]);

  const handleCopy = async () => {
    if (!processedResult.text) return;
    try {
      await navigator.clipboard.writeText(processedResult.text);
      setCopied(true);
      hapticPulse(1.5);
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
    a.download = `wms_barcodes_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    hapticPulse(1);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/25">
      <AntigravityCanvas />
      <AppHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full bg-primary/10 px-3 text-[11px] font-mono font-semibold text-primary border border-primary/20">
                <Barcode className="h-3.5 w-3.5" />
                QUANTUM EXTRACTOR
              </span>
              <span className="text-xs font-mono text-muted-foreground">WMS Batch Processing</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Выделитель ШК / Стикеров
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Автоматическая нормализация, очистка от лишних символов, дедупликация и форматирование штрихкодов из любых отчётов и таблиц.
            </p>
          </div>

          {/* Quick Options Toolbar */}
          <div className="antigravity-card flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold text-muted-foreground uppercase mr-1">
                Разделитель:
              </span>
              {[
                { id: "newline", label: "Новая строка (\\n)" },
                { id: "comma", label: "Запятая (,)" },
                { id: "semicolon", label: "Точка с запятой (;)" },
                { id: "space", label: "Пробел" },
                { id: "custom", label: "Свой..." },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDelimiter(d.id);
                    hapticPulse(0.5);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    delimiter === d.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-background/60 text-muted-foreground hover:text-foreground border border-border"
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
                  className="h-8 w-20 rounded-full border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRemoveDuplicates(!removeDuplicates)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  removeDuplicates
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold"
                    : "bg-background/60 border-border text-muted-foreground"
                }`}
              >
                {removeDuplicates ? "✓ Без дубликатов" : "С дубликатами"}
              </button>

              <button
                type="button"
                onClick={() => setOnlyNumbers(!onlyNumbers)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  onlyNumbers
                    ? "bg-purple-500/15 border-purple-500/30 text-purple-400 font-semibold"
                    : "bg-background/60 border-border text-muted-foreground"
                }`}
              >
                {onlyNumbers ? "✓ Только цифры (ШК)" : "Все символы"}
              </button>
            </div>
          </div>

          {/* Dual Terminals: Input & Output */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Terminal */}
            <div className="antigravity-card flex flex-col rounded-3xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-mono font-semibold text-foreground">
                    Исходные данные (Raw Input)
                  </span>
                </div>
                {inputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInputText("");
                      hapticPulse(1);
                    }}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Очистить
                  </Button>
                )}
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Вставьте сюда список штрихкодов, стикеров или скопированные столбцы из Excel / 1C / WMS..."
                rows={14}
                className="mt-4 w-full flex-1 resize-none rounded-2xl bg-background/50 border border-border/60 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <div className="mt-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Строк: {inputText ? inputText.split("\n").length : 0}</span>
                <span>Символов: {inputText.length}</span>
              </div>
            </div>

            {/* Output Terminal */}
            <div className="antigravity-card flex flex-col rounded-3xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-mono font-semibold text-foreground">
                    Результат обработки (Cleaned Output)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!processedResult.text}
                    className="h-8 rounded-full text-xs font-mono"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    .TXT
                  </Button>

                  <Button
                    variant={copied ? "default" : "quantum"}
                    size="sm"
                    onClick={handleCopy}
                    disabled={!processedResult.text}
                    className="h-8 rounded-full text-xs font-mono"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Скопировано!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Копировать
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <textarea
                readOnly
                value={processedResult.text}
                placeholder="Здесь появятся отформатированные и очищенные штрихкоды..."
                rows={14}
                className="mt-4 w-full flex-1 resize-none rounded-2xl bg-background/50 border border-border/60 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none select-all"
              />

              {/* Stats Bar */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-background/40 p-3 text-center border border-border/40 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground">Всего: </span>
                  <span className="font-bold text-foreground">{processedResult.stats.total}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Уникальных: </span>
                  <span className="font-bold text-emerald-400">{processedResult.stats.unique}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Удалено дублей: </span>
                  <span className="font-bold text-purple-400">{processedResult.stats.removed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SeparatorPage() {
  return (
    <AntigravityProvider>
      <SeparatorToolContent />
    </AntigravityProvider>
  );
}
