"use client";

import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoMark } from "@/components/LogoMark";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

export function AppHeader() {
  const pathname = usePathname();
  const isToolsActive = pathname?.startsWith("/tools");
  const isSeparatorActive = pathname === "/tools/separator";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Открыть меню"
              className="shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px]" aria-labelledby="sidebar-menu-title">
            <SheetHeader className="mb-2">
              <SheetTitle id="sidebar-menu-title">Меню</SheetTitle>
            </SheetHeader>
            <nav className="space-y-1">
              <SheetClose asChild>
                <Link
                  href="/tools"
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isToolsActive && "bg-muted text-foreground"
                  )}
                >
                  Инструменты
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/tools/separator"
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isSeparatorActive && "bg-muted text-foreground"
                  )}
                >
                  Выделитель ШК/Стикера
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
        <Link
          href="/"
          aria-label="WMS Stats Home"
          className="flex items-center gap-2 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <LogoMark className="h-7 w-7" />
          <span className="leading-none">WMS Stats</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
