"use client";

import { motion } from "framer-motion";
import React from "react";
import { Status } from "@/hooks/useStatuses";
import { Card, CardContent } from "@/components/ui/card";

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
