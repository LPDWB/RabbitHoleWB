"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface Props {
  visible: boolean;
  children: React.ReactNode;
}

const SearchResults: React.FC<Props> = ({ visible, children }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-3 overflow-y-auto max-h-[60vh]"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export default SearchResults;
