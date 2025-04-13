"use client";

import { create } from "zustand";
import { Card } from "@/types";
import { sampleImages } from "@/data/sample-data";

interface CardState {
  cards: Card[];
  activeCardId: string | null;
  addCard: (title: string) => void;
  updateCardPosition: (id: string, x: number, y: number) => void;
  setActiveCard: (id: string | null) => void;
  getRandomImage: () => string;
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  activeCardId: null,

  addCard: (card: Card) => {
    set((state) => ({
      cards: [...state.cards, card],
      activeCardId: card.id
    }));
  },
  

  updateCardPosition: (id: string, x: number, y: number) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id
          ? { ...card, position: { x, y } }
          : card
      )
    }));
  },

  setActiveCard: (id: string | null) => {
    set({ activeCardId: id });
  },

  getRandomImage: () => {
    return sampleImages[Math.floor(Math.random() * sampleImages.length)];
  }
}));
