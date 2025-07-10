import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
=======
>>>>>>> e3cf2158384b7b8bebe36de508f63a50a69c3330

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
<<<<<<< HEAD
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ minHeight: "100vh" }}
          >
            {children}
          </motion.div>
=======
          {children}
>>>>>>> e3cf2158384b7b8bebe36de508f63a50a69c3330
        </ThemeProvider>
      </body>
    </html>
  );
}
