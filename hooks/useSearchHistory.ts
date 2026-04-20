"use client";

import { useCallback, useEffect, useState } from "react";
import type { GiftResult } from "@/types";

const KEY = "muhtar_history";

export interface HistoryEntry {
  id: string;
  query: { gender: string; age: number; interests: string[]; budget: number };
  results: GiftResult[];
  createdAt: string;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setHistory(JSON.parse(raw));
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    const next: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
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