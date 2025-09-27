"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

const tools = [
  {
    label: "Выделитель ШК/Стикера",
    href: "/tools/extractor",
  },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-foreground">
        WMS Stats
      </Link>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-9 px-3 py-2 text-sm font-medium bg-transparent text-foreground hover:bg-muted">
              Инструменты
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12rem]">
            {tools.map((tool) => (
              <DropdownMenuItem key={tool.href} asChild>
                <Link
                  href={tool.href}
                  className={cn(
                    "block w-full rounded-sm px-2 py-1.5 text-sm transition-colors",
                    pathname?.startsWith(tool.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  )}
                >
                  {tool.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  );
}
