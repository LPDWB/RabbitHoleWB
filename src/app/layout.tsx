import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import ErrorBoundary from "@/components/ErrorBoundary";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});


const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "База знаний // Регламенты WMS",
  description: "Корпоративный дашборд для регламентов WMS и база статусов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans bg-slate-950 text-slate-100 antialiased selection:bg-fuchsia-500/30 selection:text-fuchsia-200`}
      >
        <ErrorBoundary>
          <div className="min-h-screen w-full bg-slate-950 text-slate-100">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
