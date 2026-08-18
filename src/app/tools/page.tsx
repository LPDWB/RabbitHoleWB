"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Barcode, Compass } from "lucide-react";
import { motion } from "framer-motion";

import { AppHeader } from "@/components/AppHeader";
import { AntigravityCanvas } from "@/components/AntigravityCanvas";
import { AntigravityProvider } from "@/components/AntigravityContext";

const tools = [
  {
    title: "Статусы WMS",
    description: "Мгновенная расшифровка кодов складских операций с подробными инструкциями для операторов ТСД и ревизоров.",
    href: "/",
    icon: Compass,
    badge: "Основной модуль",
    category: "Справочник и регламенты",
    gradient: "from-blue-500/20 via-primary/10 to-transparent",
  },
  {
    title: "Выделитель ШК / Стикеров",
    description: "Пакетное извлечение, нормализация, дедупликация и форматирование штрихкодов из таблиц и неструктурированных логов.",
    href: "/tools/separator",
    icon: Barcode,
    badge: "Пакетная обработка",
    category: "Утилита данных",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
  },
];

function ToolsCatalogContent() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/25">
      <AntigravityCanvas />
      <AppHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Инструменты и утилиты WMS
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Набор интеллектуальных утилит для ускорения рутинных операций склада, аналитики и контроля товародвижения.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative flex flex-col justify-between rounded-3xl p-8 antigravity-card overflow-hidden hover:border-primary/50"
                >
                  {/* Subtle Background Glow */}
                  <div
                    className={`absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${tool.gradient} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}
                  />

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border/80 text-primary shadow-sm group-hover:scale-110 group-hover:border-primary/50 transition-all">
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 font-mono text-xs font-semibold text-primary">
                        {tool.badge}
                      </span>
                    </div>

                    <div className="mt-6">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        {tool.category}
                      </span>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-normal">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-border/50 flex items-center justify-between">
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all"
                    >
                      <span>Открыть модуль</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <span className="text-xs font-mono text-muted-foreground/60">
                      v3.2 • Ready
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <AntigravityProvider>
      <ToolsCatalogContent />
    </AntigravityProvider>
  );
}
