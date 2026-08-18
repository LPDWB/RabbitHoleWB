"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Barcode,
  Compass,
  Layers,
  Menu,
  Moon,
  Sun,
  Orbit,
} from "lucide-react";
import { motion } from "framer-motion";


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

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { zeroG, toggleZeroG, hapticPulse } = useAntigravity();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      href: "/",
      label: "Каталог WMS",
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
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-2xl transition-all duration-300">
      {/* Top Google Multi-Color Laser Strip */}
      <div className="h-[2px] w-full google-laser-gradient" />

      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={() => hapticPulse(1)}
            className="group flex items-center gap-3 transition-transform active:scale-95"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-card/80 p-1.5 shadow-sm ring-1 ring-border/80 group-hover:ring-primary/50 transition-all">
              <LogoMark className="h-full w-full" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                  Antigravity
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                  Google WMS
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Quantum Console v3.2
              </span>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden md:flex items-center gap-1.5 ml-6 pl-6 border-l border-border/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => hapticPulse(0.5)}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    item.active
                      ? "bg-primary/15 text-primary shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-full border border-primary/40 pointer-events-none"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Zero-G Physics Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleZeroG}
            className={`hidden sm:flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-mono transition-all ${
              zeroG
                ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(66,133,244,0.25)]"
                : "bg-background/40 border-border text-muted-foreground"
            }`}
            title="Переключить режим невесомости"
          >
            <Orbit className={`h-3.5 w-3.5 ${zeroG ? "animate-spin text-primary" : ""}`} style={{ animationDuration: "8s" }} />
            <span>Zero-G: {zeroG ? "ON" : "OFF"}</span>
          </Button>

          {/* Live Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-full bg-card/60 border border-border/60 px-3 py-1.5 text-xs font-mono text-muted-foreground backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>SYNC: 100%</span>
          </div>

          {/* Theme Switcher */}
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                hapticPulse(1);
              }}
              className="rounded-full h-9 w-9 border-border/80 bg-card/60 backdrop-blur-md hover:border-primary/40"
              aria-label="Сменить тему"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500 transition-transform rotate-0 hover:-rotate-45 duration-300" />
              )}
            </Button>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden rounded-full h-9 w-9 border-border/80 bg-card/60"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Меню</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-background/95 backdrop-blur-3xl border-border/60">
              <SheetHeader className="pb-6 border-b border-border/50">
                <SheetTitle className="flex items-center gap-3">
                  <LogoMark className="h-7 w-7" />
                  <div className="flex flex-col text-left">
                    <span className="font-display text-base font-bold">Antigravity WMS</span>
                    <span className="text-[11px] font-mono text-muted-foreground">Google Cloud Console</span>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 py-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
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
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                          item.active
                            ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                            : "text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
                    Управление физикой
                  </span>
                  <div className="flex items-center justify-between rounded-2xl bg-card p-4 border border-border/60">
                    <div className="flex items-center gap-3">
                      <Orbit className="h-5 w-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Режим Zero-G</span>
                        <span className="text-xs text-muted-foreground">Невесомость и частицы</span>
                      </div>
                    </div>
                    <Button
                      variant={zeroG ? "default" : "outline"}
                      size="sm"
                      onClick={toggleZeroG}
                      className="rounded-full text-xs"
                    >
                      {zeroG ? "ВКЛ" : "ВЫКЛ"}
                    </Button>
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
