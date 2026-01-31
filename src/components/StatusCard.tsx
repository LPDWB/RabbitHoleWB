"use client";

import { motion } from "framer-motion";
import React from "react";
import { Status } from "@/hooks/useStatuses";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  status: Status;
  query: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string) {
  const safeText = text ?? "";
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return safeText;
  const escapedQuery = escapeRegExp(trimmedQuery);
  const splitRegex = new RegExp(`(${escapedQuery})`, "gi");
  const lowerQuery = trimmedQuery.toLowerCase();

  return safeText.split(splitRegex).map((part, i) =>
    part.toLowerCase() === lowerQuery ? (
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
      <Card className="rounded-2xl transition-colors hover:border-[color:var(--glass-ring)] hover:shadow-lg focus-within:ring-2 focus-within:ring-[color:var(--glass-ring)]">
        <CardContent className="space-y-2 p-5">
          <div className="text-lg font-semibold leading-tight">{highlight(status.code, query)}</div>
          <div className="text-sm leading-relaxed text-foreground/90">{highlight(status.description, query)}</div>
          {status.action && (
            <div className="text-sm text-muted-foreground">
              Действия: {highlight(status.action, query)}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatusCard;
