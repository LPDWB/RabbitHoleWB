"use client";

import React, { useEffect, useState } from "react";

export const LoadingText: React.FC = () => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center italic tracking-wider text-muted-foreground animate-fade">
      {`Загрузка${".".repeat(dots)}`}
    </div>
  );
};

export default LoadingText;
