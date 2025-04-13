import React from "react";
import { motion } from "framer-motion";

interface ConnectorProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export const Connector: React.FC<ConnectorProps> = ({ from, to }) => {
  const path = `M${from.x},${from.y} C${from.x + 50},${from.y} ${to.x - 50},${to.y} ${to.x},${to.y}`;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <motion.path
        d={path}
        fill="transparent"
        stroke="#8884d8"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
    </svg>
  );
};