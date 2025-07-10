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
      className="absolute w-64 p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 dark:border-white/10 shadow-inner rounded-xl"
      style={{ left: x, top: y }}
      layout
    >
      {children}
    </motion.div>
  );
};

export default Card;