"use client";

import { motion } from "framer-motion";
import React from "react";

export const SkeletonCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-muted rounded-lg animate-pulse h-[140px] w-full max-w-[400px]"
  />
);

export default SkeletonCard;
