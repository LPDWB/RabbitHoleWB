"use client";

import React from "react";
import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

import { Card as CardType } from "@/types";
import { cn } from "@/lib/utils";

interface CardProps {
  card: CardType;
  isActive: boolean;
  onClick: () => void;
}

export const Card: React.FC<CardProps> = ({ card, isActive, onClick }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    rotate: `${card.angle || 0}deg`,
    zIndex: isActive ? 10 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "absolute w-[300px] h-[300px] bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 dark:border-white/10 shadow-inner rounded-xl overflow-hidden cursor-pointer transform transition-transform duration-200 ease-out",
        isActive && "scale-105 ring-2 ring-primary"
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {card.imageUrl && (
        <div className="relative w-full h-full">
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-6">
            <h3 className="text-white text-xl font-semibold line-clamp-2">
              {card.title}
            </h3>
          </div>
          <div className="absolute bottom-2 right-2 w-6 h-6 z-10">
            <Image
              src="https://ext.same-assets.com/3343304408/1076237809.png"
              alt="Rabbit icon"
              width={27}
              height={29}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};
