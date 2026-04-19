"use client";

import React, { useEffect, useState } from "react";

export const LoadingText: React.FC = () => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDots((value) => (value % 3) + 1);
    }, 450);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-[0_10px_30px_hsl(243_48%_4%_/_0.2)]">
      <span className="h-1.5 w-1.5 rounded-full bg-accent/80" />
      {`Поиск по базе статусов${".".repeat(dots)}`}
    </div>
  );
};

export default LoadingText;
