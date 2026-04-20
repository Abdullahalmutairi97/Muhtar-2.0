"use client";

import { useState } from "react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function HistoryPage() {
  const { history, clearHistory } = useSearchHistory();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <Clock className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No searches yet.</p>
        <p className="text-xs text-muted-foreground">Your gift searches will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{history.length} search{history.length !== 1 ? "es" : ""}</p>
        <Button variant="ghost" size="sm" onClick={clearHistory} className="gap-1.5 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" /> Clear all
        </Button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const isOpen = expanded === entry.id;
          return (
            <div key={entry.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-card-foreground">
                    {entry.query.gender} · Age {entry.query.age} · {entry.query.budget.toLocaleString("en-SA")} SAR
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.query.interests.length > 0
                      ? entry.query.interests.join(", ")
                      : "No interests specified"}{" "}
                    · {formatDate(entry.createdAt)}
                  </p>
                </div>
                {isOpen
                  ? <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="size-4 text-muted-foreground shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {entry.results.length} result{entry.results.length !== 1 ? "s" : ""}
                  </p>
                  {entry.results.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-card-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.store}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-foreground">
                        {r.price.toLocaleString("en-SA")} SAR
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}