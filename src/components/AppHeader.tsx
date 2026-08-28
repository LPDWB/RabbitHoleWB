"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Barcode,
  Compass,
  Layers,
  Menu,
  Search,
  X,
  Sparkles,
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

interface AppHeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  totalMatches?: number;
  totalCount?: number;
}

export function AppHeader({
  searchQuery = "",
  onSearchChange,
  totalMatches,
  totalCount,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { hapticPulse } = useAntigravity();

  const isHomePage = pathname === "/";

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        hapticPulse(1);
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        if (searchQuery && onSearchChange) {
          onSearchChange("");
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, onSearchChange, hapticPulse]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHomePage) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0e0c15]/85 backdrop-blur-2xl transition-all duration-300">
      {/* Ultra-thin neon gradient border glow line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-fuchsia-600 via-pink-500 to-violet-600 opacity-80" />

      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            onClick={() => hapticPulse(1)}
            className="group flex items-center gap-3 transition-transform active:scale-95"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] p-2 border border-white/10 group-hover:border-fuchsia-500/50 group-hover:shadow-[0_0_20px_rgba(217,70,239,0.25)] transition-all">
              <LogoMark className="h-full w-full" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-fuchsia-100 to-pink-200 bg-clip-text text-transparent">
                  Antigravity WMS
                </span>
                <span className="hidden xl:inline-flex items-center rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-2 py-0.5 text-[10px] font-mono text-fuchsia-300 font-semibold">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 hidden sm:block">
                База знаний операций склада
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Large Fixed Glassmorphism Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            {/* Ambient neon focus glow */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-fuchsia-600/30 via-pink-600/20 to-purple-600/30 opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300 pointer-events-none" />

            <div className="relative flex items-center gap-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] focus-within:bg-white/[0.08] border border-white/10 focus-within:border-fuchsia-500/60 focus-within:ring-2 focus-within:ring-fuchsia-500/20 px-4 py-2.5 sm:py-3 transition-all shadow-inner">
              <Search className="h-5 w-5 text-fuchsia-400 shrink-0 transition-transform group-focus-within:scale-110" />

              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  if (onSearchChange) {
                    onSearchChange(e.target.value);
                    hapticPulse(0.3);
                  }
                }}
                placeholder="Поиск по названию (напр. Приемка, Сборка) или статусу (AIP, ASP)..."
                className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />

              {/* Match Counter Badge */}
              {searchQuery && totalMatches !== undefined && (
                <span className="hidden md:inline-flex items-center rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 px-2.5 py-0.5 text-xs font-mono font-semibold text-fuchsia-300 shrink-0">
                  {totalMatches} {totalMatches === 1 ? "статус" : "статусов"}
                </span>
              )}

              {/* Clear button */}
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onSearchChange) {
                      onSearchChange("");
                      inputRef.current?.focus();
                      hapticPulse(0.8);
                    }
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 hover:bg-fuchsia-500/30 text-zinc-400 hover:text-white transition-all shrink-0"
                  title="Очистить поиск"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-400/80 border border-white/10 rounded-lg px-2 py-0.5 bg-white/[0.02] shrink-0">
                  <kbd>/</kbd>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => hapticPulse(0.5)}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all ${
                    item.active
                      ? "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 font-semibold shadow-[0_0_15px_rgba(217,70,239,0.15)]"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sync indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs font-mono text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="hidden xl:inline">LIVE DB</span>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden rounded-xl h-10 w-10 border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08]"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Меню</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-[#0e0c15]/95 backdrop-blur-3xl border-white/10 text-zinc-100">
              <SheetHeader className="pb-6 border-b border-white/10">
                <SheetTitle className="flex items-center gap-3 text-zinc-100">
                  <LogoMark className="h-7 w-7" />
                  <div className="flex flex-col text-left">
                    <span className="font-display text-base font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                      Antigravity WMS
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      База знаний
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 py-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-2">
                    Навигация
                  </span>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setSheetOpen(false);
                          hapticPulse(1);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          item.active
                            ? "bg-fuchsia-500/15 text-fuchsia-300 font-semibold border border-fuchsia-500/30"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-fuchsia-400" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs font-mono text-zinc-400">
                    <Sparkles className="h-4 w-4 text-fuchsia-400" />
                    <span>Всего регламентов: {totalCount || 483}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
