"use client";

import { Grid2x2, Menu } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/78 shadow-[0_12px_38px_hsl(243_48%_4%_/_0.18)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:h-[4.35rem] lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Открыть меню"
                className="rounded-xl border border-transparent text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
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
                Internal status lookup
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground md:flex">
            <Grid2x2 className="h-3.5 w-3.5" />
            WMS Knowledge Console
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
