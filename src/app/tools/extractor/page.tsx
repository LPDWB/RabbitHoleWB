"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseIds } from "@/lib/extractor";

const MODE_OPTIONS = [
  { value: "sku" as const, label: "ШК" },
  { value: "sticker" as const, label: "Стикер" },
];

interface ToastState {
  id: number;
  message: string;
}

export default function ExtractorPage() {
  const [mode, setMode] = useState<(typeof MODE_OPTIONS)[number]["value"]>("sku");
  const [unique, setUnique] = useState(true);
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [lastProcessedRaw, setLastProcessedRaw] = useState("");

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const resultRef = useRef<HTMLTextAreaElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const resultCount = result.length;
  const resultTitle = useMemo(() => {
    const label = mode === "sku" ? "ШК" : "Стикер";
    return `Результат (${label}): ${resultCount}`;
  }, [mode, resultCount]);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    const nextToast = { id: Date.now(), message };
    setToast(nextToast);
    toastTimer.current = setTimeout(() => {
      setToast((current) => (current?.id === nextToast.id ? null : current));
    }, 2200);
  }, []);

  const processInput = useCallback(
    (input: string, { notify }: { notify: boolean }) => {
      const trimmed = input.trim();
      if (!trimmed) {
        setResult([]);
        if (notify) {
          showToast("Готово: 0 записей");
        }
        return 0;
      }

      const parsed = parseIds(input, { mode, unique });

      setResult(parsed);

      if (notify) {
        showToast(`Готово: ${parsed.length} записей`);
      }

      return parsed.length;
    },
    [mode, showToast, unique]
  );

  const handleProcess = useCallback(() => {
    processInput(raw, { notify: true });
    setLastProcessedRaw(raw);
    setHasProcessed(true);
  }, [processInput, raw]);

  const handlePaste = useCallback(async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        showToast("Не удалось получить доступ к буферу обмена");
        return;
      }

      const text = await navigator.clipboard.readText();
      if (text !== undefined) {
        setRaw(text);
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(text.length, text.length);
        });
        showToast("Данные вставлены");
      }
    } catch (error) {
      console.error(error);
      showToast("Не удалось получить данные из буфера обмена");
    }
  }, [showToast]);

  const handleCopy = useCallback(async () => {
    const content = result.join("\n");
    if (!content) {
      showToast("Нет данных для копирования");
      return;
    }

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        showToast("Скопируйте данные вручную");
        return;
      }

      await navigator.clipboard.writeText(content);
      showToast("Скопировано");
    } catch (error) {
      console.error(error);
      showToast("Не удалось скопировать данные");
    }
  }, [result, showToast]);

  const handleDownload = useCallback(() => {
    const content = result.join("\n");
    if (!content) {
      showToast("Нет данных для сохранения");
      return;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === "sku" ? "skus.txt" : "stickers.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [mode, result, showToast]);

  useEffect(() => {
    if (!hasProcessed) return;
    if (raw !== lastProcessedRaw) return;

    processInput(lastProcessedRaw, { notify: false });
  }, [hasProcessed, lastProcessedRaw, processInput, mode, unique, raw]);

  useEffect(() => {
    if (!lastProcessedRaw) return;
    if (raw !== lastProcessedRaw) {
      setHasProcessed(false);
    }
  }, [raw, lastProcessedRaw]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        !!target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");
      const isInputFocused = target === inputRef.current;
      const isResultFocused = target === resultRef.current;

      if (event.ctrlKey && key === "enter") {
        event.preventDefault();
        handleProcess();
        return;
      }

      if (event.ctrlKey && key === "v") {
        if (!isEditableTarget || isInputFocused) {
          event.preventDefault();
          handlePaste();
        }
        return;
      }

      if (event.ctrlKey && key === "c") {
        if (!isEditableTarget || isResultFocused) {
          event.preventDefault();
          handleCopy();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopy, handlePaste, handleProcess]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background pb-16 pt-28 text-foreground">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Выделитель ШК/Стикера</h1>
            <p className="text-sm text-muted-foreground">
              Вставьте данные из отчёта, выберите режим и получите очищенный список.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 rounded-lg bg-muted p-1 text-sm">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "rounded-md px-4 py-2 font-medium transition-colors",
                    mode === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={unique}
                onChange={(event) => setUnique(event.target.checked)}
                className="h-4 w-4 rounded border border-border bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              Уникальные (с сохранением порядка)
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Исходные данные</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={handlePaste}
                  className="h-9 bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
                >
                  Вставить из буфера
                </Button>
                <Button type="button" onClick={handleProcess} className="h-9 px-4 py-2 text-sm font-semibold">
                  Очистить →
                </Button>
              </div>
            </div>
            <textarea
              ref={inputRef}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder="Вставьте данные отчёта или списка..."
              className="h-80 w-full resize-none rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
            <p className="text-xs text-muted-foreground">Подсказка: можно вставлять Ctrl+V</p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{resultTitle}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="h-9 bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
                >
                  Копировать результат
                </Button>
                <Button
                  type="button"
                  onClick={handleDownload}
                  className="h-9 px-4 py-2 text-sm font-semibold"
                >
                  Скачать .txt
                </Button>
              </div>
            </div>
            <textarea
              ref={resultRef}
              value={result.join("\n")}
              readOnly
              spellCheck={false}
              className="h-80 w-full resize-none rounded-lg border border-border bg-background/40 px-4 py-3 font-mono text-sm text-foreground opacity-90 shadow-sm outline-none"
            />
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg border border-border bg-popover px-4 py-2 text-sm text-popover-foreground shadow-lg">
          {toast.message}
        </div>
      )}
    </div>
  );
}
