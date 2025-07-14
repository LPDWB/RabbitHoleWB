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
        className="mt-4 max-h-[60vh] w-full mx-auto max-w-[90%] md:max-w-[60%] overflow-y-auto space-y-3 px-4"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export default SearchResults;
