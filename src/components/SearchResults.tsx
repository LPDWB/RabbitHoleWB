"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface Props {
  visible: boolean;
  children: React.ReactNode;
}

const SearchResults: React.FC<Props> = ({ visible, children }) => (
  <AnimatePresence initial={false}>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="result-stack mt-4 flex w-full flex-col gap-3 pb-2 sm:gap-4"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export default SearchResults;
