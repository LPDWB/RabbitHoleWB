"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import React, { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Status } from "@/hooks/useStatuses";
import { copyPlainText, writePlainTextClipboardData } from "@/lib/clipboard";
import { getStatusCodeCopyText, getStatusTextCopyText } from "@/lib/statusCopy";

interface Props {
  status: Status;
  query: string;
  index?: number;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string) {
  const safeText = text ?? "";
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return safeText;

  const escapedQuery = escapeRegExp(trimmedQuery);
  const splitRegex = new RegExp(`(${escapedQuery})`, "gi");
  const lowerQuery = trimmedQuery.toLowerCase();

  return safeText.split(splitRegex).map((part, index) =>
    part.toLowerCase() === lowerQuery ? (
      <span key={index} className="rounded bg-accent/18 px-0.5 text-foreground">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function StatusCard({ status, query, index = 0 }: Props) {
  const [copied, setCopied] = useState<"code" | "text" | null>(null);

  const copyCodeText = useMemo(() => getStatusCodeCopyText(status.code ?? ""), [status.code]);
  const copyStatusText = useMemo(
    () => getStatusTextCopyText(status),
    [status]
  );

  const triggerCopiedState = (value: "code" | "text") => {
    setCopied(value);
    window.setTimeout(() => setCopied(null), 1200);
  };

  const handleCopyCode = async () => {
    const copiedCode = await copyPlainText(copyCodeText);
    if (copiedCode) {
      triggerCopiedState("code");
    }
  };

  const handleCopyText = async () => {
    const copiedText = await copyPlainText(copyStatusText);
    if (copiedText) {
      triggerCopiedState("text");
    }
  };

  const handleManualCopy = (event: React.ClipboardEvent<HTMLElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const { anchorNode, focusNode } = selection;
    if (
      (anchorNode && !event.currentTarget.contains(anchorNode)) ||
      (focusNode && !event.currentTarget.contains(focusNode))
    ) {
      return;
    }

    if (writePlainTextClipboardData(event.clipboardData, selection.toString())) {
      event.preventDefault();
    }
  };

  return (
    <motion.article
      onCopyCapture={handleManualCopy}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.04, 0.2) }}
    >
      <Card
        data-glow="strong"
        className="panel-surface-strong interactive-surface-strong group overflow-hidden rounded-[1.5rem] border-border/75"
      >
        <CardContent className="p-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
          <div className="absolute -right-20 top-0 h-40 w-40 rounded-full bg-accent/8 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/65 bg-background/45 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Найденный статус
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Status Code
                  </p>
                  <div className="flex items-end gap-3">
                    <h3 className="font-mono text-[2rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.4rem]">
                      {highlight(status.code, query)}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button
                  data-glow="action"
                  type="button"
                  onClick={handleCopyCode}
                  className="action-chip"
                  aria-label="Скопировать код статуса"
                >
                  {copied === "code" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied === "code" ? "Скопировано" : "Код"}
                </button>

                <button
                  data-glow="action"
                  type="button"
                  onClick={handleCopyText}
                  className="action-chip"
                  aria-label="Скопировать текст статуса"
                >
                  {copied === "text" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied === "text" ? "Скопировано" : "Текст"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="content-panel rounded-[1.2rem] p-4 sm:p-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Описание
                </p>
                <p className="text-sm leading-7 text-foreground/92">
                  {highlight(status.description, query)}
                </p>
              </section>

              <section className="content-panel rounded-[1.2rem] p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Действия
                  </p>
                  {copied && (
                    <span className="text-[11px] text-accent">
                      Буфер обновлен
                    </span>
                  )}
                </div>

                {status.action ? (
                  <p className="text-sm leading-7 text-muted-foreground">
                    {highlight(status.action, query)}
                  </p>
                ) : (
                  <p className="text-sm leading-7 text-muted-foreground">
                    Для этого статуса нет отдельного описания действий.
                  </p>
                )}
              </section>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}
