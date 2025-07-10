import React from "react";
import { motion } from "framer-motion";

export const SkeletonCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="bg-muted rounded-lg animate-pulse h-[140px] w-full max-w-[400px]"
  />
);

export default SkeletonCard;
