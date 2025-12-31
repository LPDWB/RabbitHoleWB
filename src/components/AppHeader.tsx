"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Инструменты", href: "/tools" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary via-blue-500 to-emerald-400 shadow-sm" />
        WMS Stats
      </Link>
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Button
                key={item.href}
                asChild
                className={cn(
                  "relative h-9 px-3 py-2 text-sm font-medium bg-transparent text-muted-foreground shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/70 hover:bg-background"
                    : "hover:bg-muted/70"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
