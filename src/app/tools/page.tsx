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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Инструменты</h1>
          <p className="text-sm text-muted-foreground">Подборка утилит для работы со складами.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.href}
              className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card/60 p-6 shadow-lg backdrop-blur"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold">{tool.title}</h2>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
              <div className="mt-6">
                <Button asChild className="w-full sm:w-auto">
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
