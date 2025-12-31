"use client";

import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";

const tools = [
  {
    title: "Выделитель ШК/Стикера",
    description: "Быстро очищает и выравнивает списки ШК или стикеров из отчётов.",
    href: "/tools/separator",
  },
];

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen bg-background pb-16 pt-28 text-foreground">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary/80">Коллекция утилит</p>
          <div>
            <h1 className="text-3xl font-semibold leading-tight">Инструменты</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Подборка быстрых помощников для повседневной работы со складами.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.href}
              className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card/70 p-6 shadow-sm transition-colors hover:border-ring/70 hover:shadow-md focus-within:ring-2 focus-within:ring-ring/60"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 via-primary to-emerald-500/80 text-background shadow-sm" />
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">{tool.title}</h2>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
              <div className="mt-6">
                <Button asChild className="w-full sm:w-auto" variant="default">
                  <Link href={tool.href}>Открыть</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
