"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "muhtar_credits";
const INITIAL = 100;

interface CreditsCtx {
  credits: number;
  deduct: (amount: number) => boolean;
  add: (amount: number) => void;
}

const CreditsContext = createContext<CreditsCtx | null>(null);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number>(INITIAL);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setCredits(Number(stored));
  }, []);

  function deduct(amount: number): boolean {
    if (credits < amount) return false;
    setCredits((prev) => {
      const next = prev - amount;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
    return true;
  }

  function add(amount: number) {
    setCredits((prev) => {
      const next = prev + amount;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <CreditsContext.Provider value={{ credits, deduct, add }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCreditsContext() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCreditsContext must be used within CreditsProvider");
  return ctx;
}