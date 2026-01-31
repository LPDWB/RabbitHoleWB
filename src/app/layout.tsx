import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RabbitHole Clone",
  description: "A launchpad for your curiosity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="transition-colors duration-500 ease-in-out"
    >
      <body
        className={`${inter.className} transition-colors duration-500 ease-in-out`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="min-h-screen w-full bg-background transition-colors duration-500">
              {children}
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
