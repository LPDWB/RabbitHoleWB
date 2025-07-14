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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-card text-card-foreground shadow-md p-4 space-y-1"
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
