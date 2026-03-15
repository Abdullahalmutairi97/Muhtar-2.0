"use client";

import { useCallback, useEffect, useState } from "react";

export interface HistoryEntry {
  id: string;
  type: "gift" | "comparison" | "chat";
  query: string;
  credits: number;
  at: string;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setHistory(data); })
      .catch(() => {});
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "at">) => {
    const next: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
    };
    setHistory((prev) => [next, ...prev].slice(0, 50));
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    fetch("/api/history", { method: "DELETE" });
  }, []);

  return { history, addEntry, clearHistory };
}
