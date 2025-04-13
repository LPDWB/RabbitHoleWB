import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  x: number;
  y: number;
}

export const Card: React.FC<CardProps> = ({ children, x, y }) => {
  return (
    <motion.div
      className="absolute w-64 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-md"
      style={{ left: x, top: y }}
      layout
    >
      {children}
    </motion.div>
  );
};

export default Card;