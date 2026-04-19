"use client";

import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/LogoMark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

export function AppHeader() {
  const pathname = usePathname();
  const isToolsActive = pathname?.startsWith("/tools");

  return (
    <header className="sticky top-0 z-50 bg-background/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:h-[4.25rem] lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Открыть меню"
                className="rounded-xl text-muted-foreground hover:bg-card/45 hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[320px]" aria-labelledby="sidebar-menu-title">
              <SheetHeader className="mb-4">
                <SheetTitle id="sidebar-menu-title">Навигация</SheetTitle>
              </SheetHeader>

              <nav className="space-y-2">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground",
                      !isToolsActive && "bg-muted text-foreground"
                    )}
                  >
                    Главная
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href="/tools"
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground",
                      isToolsActive && "bg-muted text-foreground"
                    )}
                  >
                    Инструменты
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            aria-label="WMS Stats"
            className="flex items-center gap-3 rounded-xl transition-colors hover:text-foreground"
          >
            <LogoMark className="h-8 w-8" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                WMS Stats
              </span>
              <span className="text-[11px] text-muted-foreground">
                Статусы WMS
              </span>
            </div>
          </Link>
        </div>

        <ThemeToggle />
      </div>
      <div className="mx-auto h-px w-full max-w-[1440px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent px-4 sm:px-6 lg:px-8" />
    </header>
  );
}
