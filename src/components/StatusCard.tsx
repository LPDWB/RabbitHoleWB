"use client";

import { motion } from "framer-motion";
import React from "react";
import { Status } from "@/hooks/useStatuses";

interface Props {
  status: Status;
  query: string;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-foreground/20">
        {part}
      </span>
    ) : (
      part
    )
  );
}

const StatusCard: React.FC<Props> = ({ status, query }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-white/20 bg-black/10 dark:bg-white/10 backdrop-blur-lg text-card-foreground shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] p-4 space-y-1 transition-all duration-200 ease-in-out"
    >
      <div className="font-bold text-lg">{highlight(status.code, query)}</div>
      <div>{highlight(status.description, query)}</div>
      {status.action && (
        <div className="text-sm opacity-75">
          Действия: {highlight(status.action, query)}
        </div>
      )}
    </motion.div>
  );
};

export default StatusCard;
