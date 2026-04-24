"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "muhtar_history";

export interface HistoryEntry {
  id: string;
  type: "gift" | "comparison";
  query: string;
  credits: number;
  at: string;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try { setHistory(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "at">) => {
    const next: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [next, ...prev].slice(0, 50);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(KEY);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}