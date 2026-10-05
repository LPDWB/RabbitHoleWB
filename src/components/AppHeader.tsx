"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Barcode,
  Compass,
  Layers,
  Search,
  X,
  Menu,
} from "lucide-react";

import { LogoMark } from "@/components/LogoMark";
import { useAntigravity } from "@/components/AntigravityContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface AppHeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  totalMatches?: number;
  totalCount?: number;
  showSearchBar?: boolean;
}

export function AppHeader({
  searchQuery = "",
  onSearchChange,
  totalMatches,
  totalCount,
  showSearchBar = true,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { hapticPulse } = useAntigravity();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const isHomePage = pathname === "/";
  const query = onSearchChange ? searchQuery : localQuery;
  const isSearchActive = query.trim().length > 0;

  // Sync prop changes to local state
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleQueryChange = React.useCallback(
    (val: string) => {
      if (onSearchChange) {
        onSearchChange(val);
      } else {
        setLocalQuery(val);
        if (!isHomePage && val.trim().length > 0) {
          router.push(`/?q=${encodeURIComponent(val)}`);
        }
      }
    },
    [onSearchChange, isHomePage, router]
  );

  // Global '/' keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        hapticPulse?.(1);
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        if (query) {
          handleQueryChange("");
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query, hapticPulse, handleQueryChange]);

  const navItems = [
    {
      href: "/",
      label: "Статусы",
      icon: Compass,
      active: pathname === "/",
    },
    {
      href: "/tools/separator",
      label: "Выделитель ШК",
      icon: Barcode,
      active: pathname === "/tools/separator",
    },
    {
      href: "/tools",
      label: "Инструменты",
      icon: Layers,
      active: pathname === "/tools",
    },
  ];

  return (
    <>
      {/* Fixed Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 sm:h-20 border-b border-zinc-800/80 bg-[#0e0c15]">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <Link
              href="/"
              onClick={() => hapticPulse?.(1)}
              className="group flex items-center gap-2.5 transition-transform active:scale-95"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 group-hover:border-fuchsia-500/50 transition-colors">
                <LogoMark className="h-full w-full" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-sm sm:text-base font-extrabold tracking-tight text-zinc-100">
                    Antigravity WMS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:block">
                  База регламентов склада
                </span>
              </div>
            </Link>
          </div>

          {/* Reserved Center Area: Header width placeholder for search input when active */}
          <div className="hidden lg:block flex-1 max-w-xl md:max-w-2xl mx-auto" />

          {/* Right: Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => hapticPulse?.(0.5)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      item.active
                        ? "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 font-semibold"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Total Statuses Pill */}
            {totalCount !== undefined && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1 text-xs font-mono text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{totalCount} регламентов</span>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden rounded-lg h-9 w-9 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Меню</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[280px] bg-[#0e0c15] border-zinc-800 text-zinc-100">
                <SheetHeader className="pb-4 border-b border-zinc-800">
                  <SheetTitle className="flex items-center gap-2.5 text-zinc-100">
                    <LogoMark className="h-6 w-6" />
                    <span className="font-bold text-sm">Antigravity WMS</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSheetOpen(false)}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            item.active
                              ? "bg-fuchsia-500/10 text-fuchsia-300 font-semibold"
                              : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                          }`}
                        >
                          <Icon className="h-4 w-4 text-fuchsia-400" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-zinc-800">
                    <div className="text-xs font-mono text-zinc-400 px-3">
                      Всего в базе: {totalCount || 491} регламентов
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Dynamic Animated Search Bar:
          - Initial state (input empty): translate-y-[35vh] (centered on screen)
          - Active state (input has >= 1 char): translate-y-0 (header position)
          - Pure CSS transform animation: transition-transform duration-500 ease-out transform
          - No top, margin, or padding animations for 60 FPS hardware acceleration
      */}
      {showSearchBar && (
        <div
          className={`fixed left-0 right-0 top-3 sm:top-4 z-50 flex justify-center px-4 pointer-events-none transition-transform duration-500 ease-out transform ${
            isSearchActive || !isHomePage ? "translate-y-0" : "translate-y-[35vh]"
          }`}
        >
          <div className="w-full max-w-xl md:max-w-2xl pointer-events-auto">
            <div className="relative flex items-center rounded-xl bg-[#14121d] border border-zinc-700/80 focus-within:border-fuchsia-500/80 px-3.5 py-2.5 sm:py-3 transition-colors">
              <Search className="h-4.5 w-4.5 text-zinc-400 focus-within:text-fuchsia-400 shrink-0 mr-2.5" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Поиск по коду (AIP, ASP...) или операции (Приемка, Сборка)..."
                className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />

              {/* Results count pill inside input when active */}
              {isSearchActive && totalMatches !== undefined && (
                <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded px-2 py-0.5 mr-2 shrink-0">
                  {totalMatches} {totalMatches === 1 ? "статус" : "статусов"}
                </span>
              )}

              {/* Clear Button or '/' Shortcut Hint */}
              {isSearchActive ? (
                <button
                  type="button"
                  onClick={() => {
                    handleQueryChange("");
                    inputRef.current?.focus();
                    hapticPulse?.(0.8);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                  title="Очистить поиск"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center justify-center h-5 w-5 text-[11px] font-mono text-zinc-500 border border-zinc-700/80 rounded bg-zinc-900/60 shrink-0">
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AppHeader;
