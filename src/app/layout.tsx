import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/theme-provider";

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
  title: "Google Antigravity // WMS Intelligence Console",
  description: "Dynamic zero-gravity status lookup, quantum barcode & sticker parser, and warehouse intelligence system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className="dark transition-colors duration-500 ease-out"
    >
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans transition-colors duration-500 ease-out`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/25 selection:text-primary transition-colors duration-300">
              {children}
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
