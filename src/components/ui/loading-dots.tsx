"use client";

import React, { useEffect, useState } from "react";

export const LoadingDots: React.FC = () => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d % 3) + 1);
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="italic text-muted-foreground tracking-wider animate-fade">
      {`Загрузка${".".repeat(dots)}`}
    </span>
  );
};

export default LoadingDots;
