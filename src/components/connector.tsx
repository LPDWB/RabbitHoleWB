"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/types";

interface ConnectorProps {
  card: Card;
  sourcePoint: { x: number; y: number };
}

export const Connector: React.FC<ConnectorProps> = ({ card, sourcePoint }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set line style
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;

    // Start from the source point
    ctx.beginPath();
    ctx.moveTo(sourcePoint.x, sourcePoint.y);

    // Add a curve to the card's position
    // Calculate midpoint with a slight curve
    const midX = (sourcePoint.x + card.position.x + 150) / 2;
    const midY = (sourcePoint.y + card.position.y + 150) / 2;
    const cp1X = (sourcePoint.x + midX) / 2;
    const cp1Y = sourcePoint.y;
    const cp2X = (midX + card.position.x + 150) / 2;
    const cp2Y = card.position.y + 150;

    // Draw a bezier curve
    ctx.bezierCurveTo(
      cp1X, cp1Y,
      cp2X, cp2Y,
      card.position.x + 150, card.position.y + 150
    );

    ctx.stroke();
  }, [card.position, sourcePoint]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
};
