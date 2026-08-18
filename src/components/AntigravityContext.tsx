"use client";

import React, { createContext, useContext, useState } from "react";

interface AntigravityContextType {

  zeroG: boolean;
  setZeroG: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleZeroG: () => void;
  physicsIntensity: number;
  setPhysicsIntensity: (val: number) => void;
  hapticPulse: (intensity?: number) => void;
  lastHaptic: number;
}

const AntigravityContext = createContext<AntigravityContextType>({
  zeroG: true,
  setZeroG: () => {},
  toggleZeroG: () => {},
  physicsIntensity: 1,
  setPhysicsIntensity: () => {},
  hapticPulse: () => {},
  lastHaptic: 0,
});

export function AntigravityProvider({ children }: { children: React.ReactNode }) {
  const [zeroG, setZeroG] = useState(true);
  const [physicsIntensity, setPhysicsIntensity] = useState(1);
  const [lastHaptic, setLastHaptic] = useState(0);

  const toggleZeroG = () => {
    setZeroG((prev) => !prev);
    hapticPulse(1.5);
  };

  const hapticPulse = (intensity = 1) => {
    setLastHaptic(Date.now() + intensity);
  };

  return (
    <AntigravityContext.Provider
      value={{
        zeroG,
        setZeroG,
        toggleZeroG,
        physicsIntensity,
        setPhysicsIntensity,
        hapticPulse,
        lastHaptic,
      }}
    >
      {children}
    </AntigravityContext.Provider>
  );
}

export function useAntigravity() {
  return useContext(AntigravityContext);
}
