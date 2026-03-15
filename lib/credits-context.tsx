"use client";

import { createContext, useContext, useState } from "react";

interface CreditsCtx {
  credits: number;
  deduct: (amount: number) => boolean;
  add: (amount: number) => void;
}

const CreditsContext = createContext<CreditsCtx | null>(null);

export function CreditsProvider({
  initialCredits,
  children,
}: {
  initialCredits: number;
  children: React.ReactNode;
}) {
  const [credits, setCredits] = useState(initialCredits);

  function deduct(amount: number): boolean {
    if (credits < amount) return false;
    setCredits((prev) => prev - amount);
    fetch("/api/credits/deduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    return true;
  }

  function add(amount: number) {
    setCredits((prev) => prev + amount);
    fetch("/api/credits/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
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
